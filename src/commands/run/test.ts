/* tslint:disable */
import {Command, flags} from '@oclif/command'
import { cli } from 'cli-ux';
import * as fs from 'fs'
import inquirer = require('inquirer');
import { getProjectsOfCurrentUser, runTests } from '../../common';
import { getProjectConfig, setProjectConfig } from '../../common/projectConfig';
import { initHook } from '../../hooks/init';
import { getUserInfo } from '../../state/userInfo';
import {createDirIfNotExist, resolveBackendServerUrl} from '../../utils'
import * as localTunnel from 'localtunnel'

export default class RunTest extends Command {
  static description = 'Generate command to run test';

  static examples = [
    `Generate config for running commands
    `,
  ];

  static flags = {
    token: flags.string({char: 't', description: 'Crusher user token'}),
  };

  async run() {
    const {args, flags} = await this.parse(RunTest)

    await initHook({ token: flags.token });

    await this.makeSureSetupIsCorrect();
    await this.runTests();
  }

  private async createTunnel(port: string): Promise<localTunnel.Tunnel> {
    await cli.action.start('Creating tunnel to local service')
    // eslint-disable-next-line radix
    const tunnel = await localTunnel({ port: port })
    await cli.action.stop();

    tunnel.on('close', () => {
      cli.log(`Tunnel for http://localhost;${port} closed`);
      process.exit(0);
    })
    return tunnel;
  }

  async createTest() {
    const projectConfig = getProjectConfig();
    const userInfo = getUserInfo();
    execSync(`electron-app --no-sandbox --exit-on-save --projectId=${projectConfig.project} --token=${userInfo?.token}`)
    cli.log('Closing recorder now. Bye!!')
  }

  async makeSureSetupIsCorrect() {
    const userInfo = getUserInfo()
    const projectConfig = getProjectConfig()

    if (!projectConfig) return await cli.error("Crusher not installed in this directory");

    if (!projectConfig.hostEnvironment) {
      projectConfig.hostEnvironment = "local";

      const res = await inquirer.prompt({
        name: 'port',
        message: 'Enter port where your app will be served:',
        type: 'input',
      })
      projectConfig.port = res.port

      setProjectConfig({
        ...projectConfig,
      })
    }
  }

  async runTests() {
    const projectConfig = getProjectConfig();
    let host : string | undefined = undefined;
    let tunnel: localTunnel.Tunnel | undefined;
    if (projectConfig.hostEnvironment === "local") {
      const port = projectConfig.port;
      tunnel = await this.createTunnel(port);
      host = tunnel.url;

      await cli.log("Serving at " + host + " now");
    }
    try {
      await runTests(host);
    } catch (err) { } finally {
      if (tunnel!) {
        tunnel.close();
      }
    }
  }
}
