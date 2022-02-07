import { Command } from 'commander';
import * as packgeJSON from '../../package.json';

import { getProjectInfo, getTotalTestsInProject } from '../common';
import { getProjectConfig } from '../common/projectConfig';

import { getLoggedInUser, getProjectNameFromGitInfo } from '../utils/index';
import cli from "cli-ux";

const program = new Command();
program.addHelpText(
    'after',
    `
    Example call:
      $ custom-help --help`
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
        const projectConfig = getProjectConfig();
        if (!projectConfig || !projectConfig.project) {
            throw new Error(
                'Crusher not initialized in this project. Run `crusher-cli init` to fix this.'
            );
        }
        const userAccount = getLoggedInUser();
        const projectInfo = await getProjectInfo(projectConfig.project);
        const testsCountInProject = await getTotalTestsInProject(
            projectConfig.project
        );

        console.log('-----------');
        console.log('Team:', userAccount.teamName);
        console.log('Name:', userAccount.name);
        console.log('Login:', userAccount.email);
        console.log('Project name: ', projectInfo.name);
        console.log('Tests tests in this project:', testsCountInProject);
    }
}
