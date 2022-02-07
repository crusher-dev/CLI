import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

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

    getPathForType(type: string) {
        const arr = type.split(":");
        return arr.join("/");
    }

    run() {
        const options = program.opts();
        const { processedArgs } = program;
        const [type] = processedArgs;
        if (fs.existsSync(path.resolve(__dirname, `${this.getPathForType(type)}.${process.env.NODE_ENV === "production" ? "js" : "ts"}`))) {
            //@ts-ignore
            const requireCommand = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
            try {
                requireCommand(path.resolve(__dirname, `${this.getPathForType(type)}.${process.env.NODE_ENV === "production" ? "js" : "ts"}`));
            } catch (err) {
                if (err.message === 'SIGINT') process.exit(1)

                console.log("Error:", err.message);
                process.exit(1);
            }
        } else {
            this.help();
        }
    }
}

process.on('uncaughtException', (err) => {
    console.log("Error:", err.message);

    process.exit(1);
});

new CommandBase();
