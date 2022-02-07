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
    .argument('<string>', 'string to split')
    .option('-h, --help', 'Show commands list')
    .option('-v, --version', 'Version of CLI')
    .parse(process.argv);

class CommandBase {
    constructor() {
        const options = program.opts();
        const { processedArgs } = program;
        const [type] = processedArgs;

        if (type === 'create') {
            require('./test/create');
            return;
        }

        if (type === 'run') {
            require('./test/run');
            return;
        }

        this.run();
    }

    run() {
        console.log(`
      create                Create a tests
      run                   run all your tests
       `);
    }
}

new CommandBase();
