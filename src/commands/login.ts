import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import { getAppConfig, setAppConfig } from '../common/appConfig';
import { initHook } from '../hooks/init';
import { getLoggedInUser } from '../utils/index';
import { isUserLoggedIn } from '../utils/index';
const program = new Command();

program.addHelpText(
    'after',
    `
    Example call:
      $ custom-help --help`
);
program
    .option('-t, --token <string>', 'Crusher user token')
    .parse(process.argv);
export default class CommandBase {
    constructor() {
    }

    printVersion() {
        console.log(packgeJSON.version);
    }

    help() {
        console.log(`Log in as a user.`);
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

    async run() {
        this.init();
        const options = program.opts();
        const { token } = options;

        const loggedIn = isUserLoggedIn();
        if (!loggedIn) {
            await initHook({ token });
        } else {
            const loggedInUser = getLoggedInUser();
            console.log(
                `You're already logged in from ${loggedInUser.email}.\nTo login from different account, run crusher-cli logout and then crusher-cli login.`
            );
        }
    }
}