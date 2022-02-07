import { Command } from 'commander';
import * as packgeJSON from '../../package.json';
import fs from 'fs';
import path from 'path';

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