import { Command } from 'commander';
import * as packgeJSON from '../../../package.json';

import { cli } from 'cli-ux';
import { runTests } from '../../common';
import { getProjectConfig } from '../../common/projectConfig';
import { initHook } from '../../hooks/init';
import { getUserInfo } from '../../state/userInfo';
import localTunnel from 'localtunnel';

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

    async run(): Promise<any> {
        const options = program.opts();
        const { token } = options;

        await initHook({ token });

        await this.makeSureSetupIsCorrect();
        await this.runTests(options);
    }

    private async createTunnel(port: string): Promise<localTunnel.Tunnel> {
        await cli.action.start('Creating tunnel to local service');
        // eslint-disable-next-line radix
        const tunnel = await localTunnel({ port: port as any });
        await cli.action.stop();

        tunnel.on('close', () => {
            cli.log(`Tunnel for http://localhost:${port} closed`);
            process.exit(0);
        });
        return tunnel;
    }

    async makeSureSetupIsCorrect() {
        const userInfo = getUserInfo();
        const projectConfig = getProjectConfig();

        if (!projectConfig)
            throw cli.error(
                "Crusher not intialized in this repo. Run 'crusher-cli init' to initialize."
            );
    }

    async runTests(flags) {
        const projectConfig = getProjectConfig();
        let host: string | undefined = undefined;
        let tunnel: localTunnel.Tunnel | undefined;
        if (projectConfig.hostEnvironment === 'local' || flags.port) {
            const port = flags.port ? flags.port : projectConfig.port;
            tunnel = await this.createTunnel(port);
            host = tunnel.url;

            await cli.log('Serving at ' + host + ' now');
        }
        try {
            await runTests(host);
        } catch (err) {
        } finally {
            if (tunnel!) {
                tunnel!.close();
            }
        }
    }
}

new CommandBase();
