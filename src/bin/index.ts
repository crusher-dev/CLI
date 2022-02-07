import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import chalk from 'chalk';

const program = new Command();

program.addHelpText(
    'after',
    `
    Example call:
      $ custom-help --help`
);
program
    .version(packgeJSON.version)
    .option('-h, --help', 'Show commands list')
    .option('-v, --version', 'Version of CLI')
    .parse(process.argv);

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
        console.log(`
  Commands
    Basic
      test create               Create a test for your project
      test run                  Run all the test for your project

    Advanced
      login               Create a test for your project
      init
      info
      whoami                  Run all the test for your project
      logout               Create a test for your project

    `);
    }

    run() {
        console.log(`

   ls                   Show all of your credit cards
   add                  Add a new credit card
   rm            [id]   Remove a credit card
   set-default   [id]   Make a credit card your default one

    `);
    }
}

new CommandBase();
