import { Command } from 'commander';
import cli from "cli-ux";
import { resolveFrontendServerUrl } from '../utils'
import { FRONTEND_SERVER_URL } from '../constants';

const program = new Command();
program.parse(process.argv);

export default class CommandBase {
    constructor() {
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
    }

    async run(): Promise<any> {
        this.init();
        await cli.open(
            `${FRONTEND_SERVER_URL}`,
          ).catch(err => {
            console.error(err)
          })
    }
}
