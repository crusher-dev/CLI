import {Command, flags} from '@oclif/command'
const {cli} = require('cli-ux')

export default class Hello extends Command {
  static description = 'Run visual diff'

  static examples = [
    `$  crusher run --crusher_token=123 --test_ids=32 -t
$  crusher run --crusher_token=123 --test_ids=32 --base_url=http://google.com
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    crusher_token: flags.string({description: 'Token from your cruser app', required: true}),
    base_url: flags.string({description: 'base_url, Not required with tunnelling'}),
    test_ids: flags.string({description: 'IDs of test you want to run [ Optiona]'}),
    test_group_id: flags.string({description: 'Test group ID'}),
    tunnel: flags.boolean({char: 't', description: 'Enable tunneling for remote machine'}),
  }

  async run() {
    const { flags} = this.parse(Hello)
    const {base_url, test_ids, test_group_id, tunnel} = flags

    if (typeof (test_ids) === 'undefined' && typeof (test_group_id) === 'undefined') {
      console.log('Either test ID or Test Group IDs are needed to run the test.')
      return
    }

    if (typeof (base_url) === 'undefined' && !tunnel) {
      console.log('Please enter base url or use tunnelling')
      return
    }

    await cli.action.start('Starting visual test')
    await new Promise(r => setTimeout(r, 1000))

    if (tunnel) {
      await cli.action.start('Creating local tunnel')
      await new Promise(r => setTimeout(r, 1000))
    }

    await cli.action.start('Starting to run Test')

    await cli.action.start('Running visual diff')
    await cli.action.start('Test complete')

    await cli.action.stop()
  }
}
