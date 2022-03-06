import { Command } from "commander";
import { getAppConfig, setAppConfig } from "../utils/appConfig";
const program = new Command();

program.addHelpText(
  "after",
  `
    Example call:
      $ custom-help --help`
);
program.parse(process.argv);

export default class CommandBase {
  constructor() {
    const options = program.opts();
    const { help, version } = options;
    if (help === true) {
      this.help();
      return;
    }

    this.run();
  }

  help() {
    console.log(`Logs user out from this machine`);
  }

  run() {
    const appConfig = getAppConfig();
    if (appConfig["userInfo"]) delete appConfig["userInfo"];
    setAppConfig(appConfig);
    console.log("Logged out from this machine");
  }
}
