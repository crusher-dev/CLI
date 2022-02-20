import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import { getAppConfig, setAppConfig } from '../common/appConfig';

import { getLoggedInUser, getProjectNameFromGitInfo } from '../utils/index';

import * as inquirer from 'inquirer';
import cli from 'cli-ux';
import { getProjectConfig } from '../common/projectConfig';
import { getInviteLink, inviteProjectMembers } from '../common';

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
    }

    printVersion() {
        console.log(packgeJSON.version);
    }

    help() {
        console.log(`Logs user out from this machine`);
    }

    init() {
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
    }

    async run(): Promise<any> {
        this.init();
        const projectConfig = getProjectConfig();

        if (!projectConfig || !projectConfig.project) {
            throw new Error(
                'Crusher not initialized in this project. Run `crusher-cli init` to fix this.'
            );
        }
        const res = await inquirer.prompt([
            {
                name: 'method',
                message: 'Choose a method:',
                type: 'list',
                choices: [
                    { name: 'Invite via email', value: 0 },
                    { name: 'Invite via link', value: 1 }
                ],
                default: 1
            }
        ]);
        console.log('\n');
        await cli.action.start('Preparing a cryptic invite code.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await cli.action.stop();

        if (res.method === 0) {
            const emailsRes = await inquirer.prompt([
                {
                    name: 'emails',
                    message: 'Who should we invite (comma separated)?',
                    type: 'input'
                }
            ]);
            console.log('Email res is', emailsRes.emails);
            await cli.action.start('Sending invites');
            const inviteRes = await inviteProjectMembers(
                projectConfig.project,
                emailsRes.emails.split(',')
            );
            await cli.action.stop();
            console.log(
                '\nInvited your folks to use crusher!. Ask them to check there mail.'
            );
        } else {
            console.log(
                'Your Invite link:',
                await getInviteLink(projectConfig.project)
            );
        }
    }
}