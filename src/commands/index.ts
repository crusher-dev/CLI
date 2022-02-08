import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const program = new Command();

program.addHelpText(
    'after',
    `
    Example call:
      $ custom-help --help`
);

export default class CommandBase {
    constructor() {
    }

    printVersion() {
        console.log(packgeJSON.version);
    }

    help() {
        console.log(`
  Run a command: ${chalk.hex('8AE234')(`npx crusher-cli [command]`)}
  Example:       ${chalk.hex('8AE234')(`npx crusher-cli create:test`)}

  ${chalk.hex('C1C1C1')('Commands')}

  Basic
      ${chalk.hex('9A4AFF')(`test:create`)}               Create a new test
      ${chalk.hex('9A4AFF')(`test:run`)}                  Run all the tests

  Other commands
      login
      open                      Open crusher in browser
      init                      Initialize project in the repo
      info
      whoami                    your info
      logout
    `);
    }

    getPathForType(type: string) {
        const arr = type.split(":");
        return arr.join("/");
    }

    run(optionsa: any = []) {
        program
            .version(packgeJSON.version)
            .argument('<string>', 'string to split')
            .option('-h, --help', 'Show commands list')
            .option('-v, --version', 'Version of CLI')
            .parse(optionsa && optionsa.length ? optionsa : process.argv);
        const options = program.opts();
        const { processedArgs } = program;
        const [type] = processedArgs;
        if (type && fs.existsSync(path.resolve(__dirname , "../commands/", `${this.getPathForType(type)}.${process.env.NODE_ENV === "production" ? "js" : "ts"}`))) {
            //@ts-ignore
            const requireCommand = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
            try {
                new (requireCommand(path.resolve(__dirname, "../commands/", `${this.getPathForType(type)}.${process.env.NODE_ENV === "production" ? "js" : "ts"}`)).default)();
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

process.on('unhandledRejection', (reason, p) => {
    console.log("Error:", (reason as Error).message);
    process.exit(1);
});