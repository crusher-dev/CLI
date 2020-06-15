import {Command, flags} from '@oclif/command'
const {cli} = require('cli-ux')

export default class Hello extends Command {
  static description = 'Run visual diff'

  static examples = [
    `Generate config for running commands
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async userLogin() {
    await cli.action.start('Opening a broswer to login')
    await new Promise(r => setTimeout(r, 2000))
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
    const runLocal = await cli.confirm('Do you run test locally? [y/n]')
    if (!runLocal) {
      return `--base_url=${await cli.prompt('Base Host')}`
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
