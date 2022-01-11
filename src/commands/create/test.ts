/* tslint:disable */
import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {initHook} from '../../hooks/init'
import {getUserInfo} from '../../state/userInfo'
import {createDirIfNotExist, resolveBackendServerUrl, resolvePathToAppDirectory} from '../../utils'
import * as fs from 'fs'
import axios from 'axios'
import * as path from 'path'
import * as commandExists from 'command-exists'
import {getRecorderBuildForPlatfrom} from '../../constants'
import cli from 'cli-ux'
import {getProjectConfig, setProjectConfig} from '../../common/projectConfig'
const {execSync} = require('child_process')
import * as inquirer from 'inquirer'
import {getProjectsOfCurrentUser} from '../../common'
export default class CreateTest extends Command {
  static description = 'Generate command to run test';

  static examples = [
    `Generate config for running commands
    `,
  ];

  static flags = {
    token: flags.string({char: 't', description: 'Crusher user token'}),
  };

  async installDependencies() {
    const BIN_dIr = resolvePathToAppDirectory('bin')

    let isCrusherInstalled = false;
    if(process.platform === "darwin") {
      const app = execSync(`ls /Applications/ | grep -i "Crusher Recorder"`).toString();
      isCrusherInstalled = app.includes("Crusher Recorder.app");
    } else {
      isCrusherInstalled = commandExists.sync('electron-app');
    }
  
    if (!isCrusherInstalled) {
      this.warn('No crusher recorder found on the system')

      const recorderBuild = getRecorderBuildForPlatfrom()
      await cli.action.start(
        `Downloading and installing the latest version of the recorder(${recorderBuild.version}):`,
      )
      const build = await axios.get(recorderBuild.url, {responseType: 'arraybuffer'})
      fs.writeFileSync(path.resolve(BIN_dIr, recorderBuild.name), build.data)

      execSync('sudo dpkg -i ' + path.resolve(BIN_dIr, recorderBuild.name))
      await cli.action.stop()
    }
  }

  async run() {
    const {args, flags} = await this.parse(CreateTest)

    await initHook({token: flags.token})
    await this.installDependencies()

    await this.makeSureSetupIsCorrect()

    await this.createTest()
  }

  async createTest() {
    const projectConfig = getProjectConfig();
    const userInfo = getUserInfo();
    if(process.platform === "darwin") {
      execSync(`/Applications/"Crusher Recorder.app"/Contents/MacOS/"Crusher Recorder" --no-sandbox --exit-on-save --projectId=${projectConfig.project} --token=${userInfo?.token}`)
    } else {
      execSync(`electron-app --no-sandbox --exit-on-save --projectId=${projectConfig.project} --token=${userInfo?.token}`)
    }
    cli.log('Closing recorder now. Bye!!')
  }

  async makeSureSetupIsCorrect() {
    const userInfo = getUserInfo()
    const projectConfig = getProjectConfig()
    if (!projectConfig) {
      const projectConfig: any = {backend: resolveBackendServerUrl(''), userInfo}
      const projects = await getProjectsOfCurrentUser()
      const projectRes = await inquirer.prompt([{
        name: 'project',
        message: 'Choose a crusher project for integration:',
        type: 'list',
        choices: projects.map(p => ({ name: p.name, value: p.id })),
        default: projects[0].id,
      }])

      projectConfig.project = projectRes.project

      const res = await inquirer.prompt({
        name: 'hostEnvironment',
        message: 'Select your environment for running test against?',
        type: 'list',
        choices: [{name: 'Local environment', value: 'local'}, {name: 'Custom host', value: 'customHost'}],
      })
      projectConfig.hostEnvironment = res.hostEnvironment

      if (res.hostEnvironment === 'local') {
        const res = await inquirer.prompt({
          name: 'port',
          message: 'Enter port where your app will be served:',
          type: 'input',
        })
        projectConfig.port = res.port
      } else if (res.hostEnvironment === 'customHost') {
        const res = await inquirer.prompt({
          name: 'customHost',
          message: 'Enter custom host where your app would be served',
          type: 'input',
        })

        projectConfig.host = res.customHost
      }
      setProjectConfig({
        ...projectConfig,
      })
    }

    // Add commands to package.json

    // Add commands to read CI config

    return {
      addedConfig: true,
      addedPackageJson: true,
      addedIntoCI: true,
    }
  }
}
