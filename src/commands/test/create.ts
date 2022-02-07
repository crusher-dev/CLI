import { Command } from 'commander';
import * as packgeJSON from '../../../package.json';

import { initHook } from '../../hooks/init';
import { getUserInfo } from '../../state/userInfo';
import {
    createDirIfNotExist,
    resolveBackendServerUrl,
    resolvePathToAppDirectory
} from '../../utils';
import * as fs from 'fs';
import axios from 'axios';
import * as path from 'path';
import * as commandExists from 'command-exists';
import { getRecorderBuildForPlatfrom } from '../../constants';
import cli from 'cli-ux';
import { getProjectConfig, setProjectConfig } from '../../common/projectConfig';
import { execSync } from 'child_process';
import * as inquirer from 'inquirer';
import { getProjectsOfCurrentUser, createProject } from '../../common';
import localTunnel from 'localtunnel';
import { getProjectNameFromGitInfo } from '../../utils/index';

const program = new Command();
program.addHelpText(
    'after',
    `
    Example call:
      $ custom-help2 --help`
);
program.parse(process.argv);

export default class CommandBase {
    constructor() {
        const options = program.opts();
        const { help, version } = options;
        if (help === true) {
            this.help();
            return;
        }

        if (version === true) {
            this.printVersion();
            return;
        }

        this.run();
    }

    printVersion() {
        console.log(packgeJSON.version);
    }

    help() {
        console.log(`Logs user out from this machine`);
    }

    async run(): Promise<any> {
        const options = program.opts();
        const { token } = options;

        await initHook({ token: token });

        await this.installDependencies();

        await this.makeSureSetupIsCorrect();

        await this.createTest(options);
    }

    async createTest(flags) {
        let tunnel: localTunnel.Tunnel | undefined;
        if (flags.port) {
            const port = flags.port;
            tunnel = await this.createTunnel(port);
            const host = tunnel.url;

            await cli.log('\nServing at ' + host + ' now \n');
        }

        const projectConfig = getProjectConfig();
        const userInfo = getUserInfo();
        if (process.platform === 'darwin') {
            execSync(
                `${resolvePathToAppDirectory(
                    'bin/"Crusher Recorder.app"/Contents/MacOS/"Crusher Recorder"'
                )} --no-sandbox --exit-on-save --projectId=${
                    projectConfig.project
                } --token=${userInfo?.token}`,
                { stdio: 'ignore' }
            );
        } else {
            execSync(
                `${resolvePathToAppDirectory(
                    'bin/electron-app'
                )} --no-sandbox --exit-on-save --projectId=${
                    projectConfig.project
                } --token=${userInfo?.token}`,
                { stdio: 'ignore' }
            );
        }

        cli.log(
            'Voila! We have create a first test. Few command that will be helpful\n'
        );
        cli.log('1.) Run all tests in your project');
        cli.log('crusher-cli test:run\n');

        cli.log('2.) Invite team members to the project');
        cli.log('crusher-cli invite\n');
    }

    async makeSureSetupIsCorrect() {
        const userInfo = getUserInfo();
        const projectConfig = getProjectConfig();
        if (!projectConfig) {
            const projectConfig: any = { backend: resolveBackendServerUrl('') };
            const projects = await getProjectsOfCurrentUser();
            const suggestedProjectName = await getProjectNameFromGitInfo();

            if (!suggestedProjectName) {
                const projectRes = await inquirer.prompt([
                    {
                        name: 'project',
                        message: 'Select your crusher project:',
                        type: 'list',
                        choices: [
                            { name: 'Create new project', value: 'new' },
                            ...projects.map(p => ({
                                name: p.name,
                                value: p.id
                            }))
                        ],
                        default: projects[0].id
                    }
                ]);

                let projectId = (projectRes as any).project;
                if (projectId === 'new') {
                    const projectName = await inquirer.prompt([
                        {
                            name: 'projectName',
                            message: 'Enter project name:',
                            type: 'input'
                        }
                    ]);

                    const project = await createProject(
                        projectName.projectName
                    );
                    projectId = project.id;
                }
                projectConfig.project = projectId;

                setProjectConfig({
                    ...projectConfig
                });
            } else {
                const projectRecord = await createProject(suggestedProjectName);
                console.log(
                    `Selecting project ${projectRecord.name} by default`
                );
                projectConfig.project = projectRecord.id;

                setProjectConfig({
                    ...projectConfig
                });
            }
        }

        // Add commands to package.json

        // Add commands to read CI config

        return {
            addedConfig: true,
            addedPackageJson: true,
            addedIntoCI: true
        };
    }

    private async createTunnel(port: string): Promise<localTunnel.Tunnel> {
        await cli.action.start('Creating tunnel to local service');
        // eslint-disable-next-line radix
        const tunnel = await localTunnel({ port: parseInt(port) });
        await cli.action.stop();

        tunnel.on('close', () => {
            cli.log(`Tunnel for http://localhost:${port} closed`);
            process.exit(0);
        });
        return tunnel;
    }

    private downloadAndSaveRecorder(): Promise<string> {
        return new Promise((resolve, reject) => {
            const packagesRecorderUrl = getRecorderBuildForPlatfrom();
            const recorderZipPath = resolvePathToAppDirectory(
                `bin/${packagesRecorderUrl.name}`
            );

            const bar = cli.progress({
                format: `Downloading latest version (${packagesRecorderUrl.version})\t[{bar}] {percentage}%`
            });
            bar.start(100, 0, { speed: 'N/A' });

            axios
                .get(packagesRecorderUrl.url, { responseType: 'stream' })
                .then(({ data, headers }) => {
                    data.pipe(fs.createWriteStream(recorderZipPath));
                    let chunksCompleted = 0;

                    data.on('data', chunk => {
                        chunksCompleted += chunk.length;
                        const percentage = Math.floor(
                            (chunksCompleted /
                                parseInt(headers['content-length'])) *
                                100
                        );
                        bar.update(percentage);

                        if (percentage === 100) {
                            bar.stop();
                            resolve(recorderZipPath);
                        }
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async handleMacInstallation() {
        cli.info('Crusher Recorder is not installed.\n');
        const recorderZipPath = await this.downloadAndSaveRecorder();

        await cli.action.start('Unzipping');
        execSync(
            `cd ${path.dirname(recorderZipPath)} && ditto -xk ${path.basename(
                recorderZipPath
            )} . && rm -R ${path.basename(recorderZipPath)}`,
            { stdio: 'ignore' }
        );

        await new Promise((resolve, reject) =>
            setTimeout(() => {
                resolve(true);
            }, 3000)
        );
        await cli.action.stop('done\n');
    }

    async handleLinuxInstallation() {
        cli.info('Crusher Recorder is not installed.\n');
        const recorderZipPath = await this.downloadAndSaveRecorder();

        await cli.action.start('Unzipping');
        execSync(
            `cd ${path.dirname(recorderZipPath)} && unzip ${path.basename(
                recorderZipPath
            )} -d . && rm -R ${path.basename(recorderZipPath)}`,
            { stdio: 'ignore' }
        );

        await new Promise((resolve, reject) =>
            setTimeout(() => {
                resolve(true);
            }, 3000)
        );
        await cli.action.stop('done\n');
    }

    async installDependencies() {
        const BIN_DIR = resolvePathToAppDirectory('bin');

        const packagesRecorderUrl = getRecorderBuildForPlatfrom();

        if (process.platform === 'darwin') {
            if (
                fs.existsSync(
                    resolvePathToAppDirectory('bin/Crusher Recorder.app')
                )
            ) {
                return;
            }

            await this.handleMacInstallation();
        } else if (process.platform === 'linux') {
            if (fs.existsSync(resolvePathToAppDirectory('bin/electron-app'))) {
                return;
            }

            await this.handleLinuxInstallation();
        }
    }
}