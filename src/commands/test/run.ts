/* tslint:disable */
import {Command, flags} from '@oclif/command'

export default class Run extends Command {
  static description = 'Run visual diff';

  static examples = [
    '$  crusher run --crusher_token=123 --test_ids=32 -t\n' +
      '$  crusher run --crusher_token=123 --test_ids=32 --base_url=http://google.com',
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    host: flags.string({description: 'Port or hostname of the server'}),
    port: flags.string({description: 'Port for tunnelling to work'}),
  };

  async run() {
    const {flags} = this.parse(Run);

  }
}
