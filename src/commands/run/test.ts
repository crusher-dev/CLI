/* tslint:disable */
import {Command, flags} from '@oclif/command'
import { cli } from 'cli-ux';
import * as fs from 'fs'
import { runTests } from '../../common';
import { getProjectConfig } from '../../common/projectConfig';
import { initHook } from '../../hooks/init';
import { getUserInfo } from '../../state/userInfo';
import {createDirIfNotExist} from '../../utils'

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

    await this.runTests();
  }

  async runTests() {
    await runTests();
  }
}
