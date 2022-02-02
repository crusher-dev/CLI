/* tslint:disable */
import {Command, flags} from '@oclif/command'
import {initHook} from '../hooks/init'
import {getUserInfo} from '../state/userInfo'
import {createDirIfNotExist, resolveBackendServerUrl, resolvePathToAppDirectory} from '../utils'
import * as fs from 'fs'
import axios from 'axios'
import * as path from 'path'
import * as commandExists from 'command-exists'
import {getRecorderBuildForPlatfrom} from '../constants'
import cli from 'cli-ux'
import {getProjectConfig, setProjectConfig} from '../common/projectConfig'
const {execSync} = require('child_process')
import * as inquirer from 'inquirer'
import { getProjectsOfCurrentUser, createProject } from '../common'
import * as localTunnel from 'localtunnel'
import { getProjectNameFromGitInfo } from '../utils/index'

export default class CrusherInit extends Command {
  static description = 'Crusher init command';

  static examples = [
    `Generate config for running commands
    `,
  ];

  static flags = {
    token: flags.string({ char: 't', description: 'Crusher user token' }),

  };

  private downloadAndSaveRecorder(): Promise<string> {
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
    const recorderZipPath = await this.downloadAndSaveRecorder();

    await cli.action.start("Unzipping");
    execSync(`cd ${path.dirname(recorderZipPath)} && ditto -xk ${path.basename(recorderZipPath)} . && rm -R ${path.basename(recorderZipPath)}`);

    await new Promise((resolve, reject) => setTimeout(() => { resolve(true); }, 3000));
    await cli.action.stop("done\n");
  }

  async handleLinuxInstallation() {
    cli.info("Crusher Recorder is not installed.\n");
    const recorderZipPath = await this.downloadAndSaveRecorder();

    await cli.action.start("Unzipping");
    execSync(`cd ${path.dirname(recorderZipPath)} && unzip ${path.basename(recorderZipPath)} -d . && rm -R ${path.basename(recorderZipPath)}`);

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
    } else if (process.platform === "linux") {
      if(fs.existsSync(resolvePathToAppDirectory("bin/electron-app"))) {
        return;
      }

      await this.handleLinuxInstallation();
    }
  }

  async run() {
    const { args, flags } = await this.parse(CrusherInit)
    await initHook({token: flags.token})

    await this.installDependencies()

    await this.makeSureSetupIsCorrect()
  }

  async makeSureSetupIsCorrect() {
    const userInfo = getUserInfo()
    const projectConfig = getProjectConfig()
    if (!projectConfig) {
      const projectConfig: any = { backend: resolveBackendServerUrl('') }
      const projects = await getProjectsOfCurrentUser();
      const suggestedProjectName = await getProjectNameFromGitInfo();

      if (!suggestedProjectName) {
        const projectRes = await inquirer.prompt([{
          name: 'project',
          message: 'Select your crusher project:',
          type: 'list',
          choices: [...projects.map(p => ({ name: p.name, value: p.id })), { name: 'Create new project', value: 'new' }],
          default: projects[0].id,
        }])

        let projectId = (projectRes as any).project
        if (projectId === 'new') {
          const projectName = await inquirer.prompt([{
            name: 'projectName',
            message: 'Enter project name:',
            type: 'input',
          }])

          const project = await createProject(projectName.projectName);
          projectId = project.id
        }
        projectConfig.project = projectId

        setProjectConfig({
          ...projectConfig,
        })
      } else {
        const projectRecord = await createProject(suggestedProjectName);
        this.log(`Selecting project ${projectRecord.name} by default`);
        projectConfig.project = projectRecord.id;

        setProjectConfig({
          ...projectConfig,
        })

      }
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

process.on('unhandledRejection', (reason, p) => {
});

process.on('uncaughtException', (err) => {

});