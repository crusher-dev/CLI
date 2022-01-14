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

  private downloadAndSaveMacRecorder(): Promise<string> {
    return new Promise((resolve, reject) => {
      const packagesRecorderUrl = getRecorderBuildForPlatfrom();
      const recorderZipPath = resolvePathToAppDirectory(`bin/${packagesRecorderUrl.name}`);
  
      const bar = cli.progress({
        format: `Downloading latest version (${packagesRecorderUrl.version})\t[{bar}] {percentage}%`,
      });
      bar.start(100, 0, { speed: 'N/A' });
  
      axios.get(packagesRecorderUrl.url, { responseType: "stream" }).then(({data, headers})=>{
        data.pipe(fs.createWriteStream(recorderZipPath));
        let chunksCompleted = 0;
    
        data.on("data", (chunk) => {
          chunksCompleted += chunk.length;
          const percentage = Math.floor((chunksCompleted / parseInt(headers['content-length'])) * 100);
          bar.update(percentage);

          if(percentage === 100) {
            bar.stop();
            resolve(recorderZipPath);
          }
        });
      }).catch((err) => { reject(err); });
    });

  }

  async handleMacInstallation() {
    cli.info("Crusher Recorder is not installed.\n");
    const recorderZipPath = await this.downloadAndSaveMacRecorder();

    await cli.action.start("Unzipping");
    execSync(`cd ${path.dirname(recorderZipPath)} && ditto -xk ${path.basename(recorderZipPath)} . && rm -R ${path.basename(recorderZipPath)}`);

    await new Promise((resolve, reject) => setTimeout(() => { resolve(true); }, 3000));
    await cli.action.stop("done\n");
  }

  async installDependencies() {
    const BIN_DIR = resolvePathToAppDirectory('bin')

    const packagesRecorderUrl = getRecorderBuildForPlatfrom();

    if(process.platform === "darwin") {
      if(fs.existsSync(resolvePathToAppDirectory("bin/Crusher Recorder.app"))) {
        return;
      }

      await this.handleMacInstallation();
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
      execSync(`${resolvePathToAppDirectory('bin/"Crusher Recorder.app"/Contents/MacOS/"Crusher Recorder"')} --no-sandbox --exit-on-save --projectId=${projectConfig.project} --token=${userInfo?.token}`)
    } else {
      execSync(`electron-app --no-sandbox --exit-on-save --projectId=${projectConfig.project} --token=${userInfo?.token}`)
    }
    cli.log('Recorder closed!!!')
  }

  async makeSureSetupIsCorrect() {
    const userInfo = getUserInfo()
    const projectConfig = getProjectConfig()
    if (!projectConfig) {
      const projectConfig: any = {backend: resolveBackendServerUrl(''), userInfo}
      const projects = await getProjectsOfCurrentUser()
      const projectRes = await inquirer.prompt([{
        name: 'project',
        message: 'Select your crusher project:',
        type: 'list',
        choices: projects.map(p => ({ name: p.name, value: p.id })),
        default: projects[0].id,
      }])

      projectConfig.project = projectRes.project

      // const res = await inquirer.prompt({
      //   name: 'hostEnvironment',
      //   message: 'Select your environment for running test against?',
      //   type: 'list',
      //   choices: [{name: 'Local environment', value: 'local'}, {name: 'Custom host', value: 'customHost'}],
      // })
      // projectConfig.hostEnvironment = res.hostEnvironment

      // if (res.hostEnvironment === 'local') {
      //   const res = await inquirer.prompt({
      //     name: 'port',
      //     message: 'Enter port where your app will be served:',
      //     type: 'input',
      //   })
      //   projectConfig.port = res.port
      // } else if (res.hostEnvironment === 'customHost') {
      //   const res = await inquirer.prompt({
      //     name: 'customHost',
      //     message: 'Enter custom host where your app would be served',
      //     type: 'input',
      //   })

      //   projectConfig.host = res.customHost
      // }
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
