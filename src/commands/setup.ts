import {Command, flags} from '@oclif/command'
import {getBackendServerUrl, getFrontendServerUrl, getUniqueString} from "../utils";
const {cli} = require('cli-ux')
const fetch = require('node-fetch');

export default class Setup extends Command {
  static description = 'Run visual diff'

  static examples = [
    `Generate config for running commands
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static randomGeneratedToken = getUniqueString();
  static userData:any = null;

  static waitForUserLogin = ():Promise<string> => {
    return new Promise((resolve,reject) => {
      const userLoginCheckPoll = async () : Promise<any> => {
        const response = await fetch(`${getBackendServerUrl()}/cli/status/${Setup.randomGeneratedToken}`).then(res => res.json());
        response.status==='Completed' && resolve(response);
      }

      setInterval(userLoginCheckPoll, 2500)
    })
  }

  static registerToken =  ()=>{
    return fetch(`${getBackendServerUrl()}/cli/add_token/${Setup.randomGeneratedToken}`)
  }

  async userLogin() {
    await cli.action.start('Opening a browser to login. Please complete that process.')
    // Intentional delay so user can read the message
    await Setup.registerToken()
    await new Promise(r => setTimeout(r, 500))

    await cli.open(`${getFrontendServerUrl()}/?cli_token=${Setup.randomGeneratedToken}`)
    Setup.userData =  await Setup.waitForUserLogin();
    console.log(Setup.userData ,"user_info")

    await cli.action.stop()
    return '--crusher_token=123'
  }

  async selectTestId() {
    const runIndividualTest = await cli.confirm('Do you want to run individual test? [y/n]')
    if (runIndividualTest) {
      return `--test_ids=${await cli.prompt('Enter individual test ids separated by comma')}`
    }

    return `--test_group_id=${await cli.prompt('Enter test group id')}`
  }

  async runLocally() {
    const runLocal = await cli.confirm('Do you run test for locally hosted website? [y/n]')
    // If not ask for base host
    if (!runLocal) {
      const baseHost = await cli.prompt('Base Host');
      return `--base_url=${baseHost}`
    }

    return ' -t'
  }

  async run() {
    const crusherTokenFlag = await this.userLogin()
    const testIDsFlag = await this.selectTestId()
    const hostParamFlag = await this.runLocally()

    const generatedCommand = `./bin/run run ${crusherTokenFlag} ${testIDsFlag} ${hostParamFlag}`

    console.log('\n\n 💁💁 Please use following command to run test\n\n')
    console.log(generatedCommand)
  }
}
