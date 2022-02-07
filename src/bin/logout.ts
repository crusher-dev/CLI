import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import { getAppConfig, setAppConfig } from '../common/appConfig';
const program = new Command();

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

    run() {
        const appConfig = getAppConfig();
        if (appConfig['userInfo']) delete appConfig['userInfo'];
        setAppConfig(appConfig);
        console.log('Logged out from this machine');
    }
}

new CommandBase();
