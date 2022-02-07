import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import { getAppConfig, setAppConfig } from '../common/appConfig';
const program = new Command();
import { getLoggedInUser, getProjectNameFromGitInfo } from '../utils/index';

program.addHelpText(
    'after',
    `
    Example call:
      $ custom-help --help`
);
program.parse(process.argv);

class CommandBase {
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

    async run() {
        const userAccount = getLoggedInUser();
        console.log('Suggested project name:', getProjectNameFromGitInfo());
        console.log('-----------');
        console.log('Team:', userAccount.teamName);
        console.log('Name:', userAccount.name);
        console.log('Login:', userAccount.email);
    }
}

new CommandBase();
