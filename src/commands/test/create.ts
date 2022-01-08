/* tslint:disable */
import {Command, flags} from '@oclif/command'
import {
  getBackendServerUrl,
  getFrontendServerUrl,
  getUniqueString,
} from '../utils'

import {prompt} from 'enquirer'
import {cli} from 'cli-ux'
import fetch  from 'node-fetch'
import * as fs from 'fs'
import {createDirIfNotExist} from '../../utils'

export default class Create extends Command {
  static description = 'Generate command to run test';

  static examples = [
    `Generate config for running commands
    `,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };


  async run() {
    console.log("df")
    // const crusherTokenFlag = await this.userLogin()
    // const testIDsFlag = await this.selectTests()
    // const hostParamFlag = await this.runLocally()
    // const generatedCommand = `npx crusher-cli run ${testIDsFlag} ${hostParamFlag} ${crusherTokenFlag} `
    //
    // console.log('\nPlease use following command to run test\n')
    // console.log(generatedCommand)
    const data = await this.makeSureSetupIsCorrect()
  }

  async createTest(){

  }

  async makeSureSetupIsCorrect(){
    try {
      fs.readFileSync(".crusherci/config.json");
    } catch (e) {
      await createDirIfNotExist(".crusherci");
      fs.writeFileSync(".crusherci/config.js", JSON.stringify({
        "backend": "http://crusher.dev",
      }))
    }

    // Add commands to package.json

    // Add commands to read CI config

    return {
      addedConfig: true,
      addedPackageJson: true,
      addedIntoCI: true,
    }
  }
}
