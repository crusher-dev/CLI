import { Command } from "commander";

import { loadUserInfoOnLoad } from "../../utils/hooks";
import { getUserInfo } from "../../state/userInfo";
import { resolvePathToAppDirectory } from "../../utils/utils";
import cli from "cli-ux";
import { getProjectConfig } from "../../utils/projectConfig";
import { execSync } from "child_process";
import localTunnel from "localtunnel";
import chalk from "chalk";
import {
  createTunnel,
  installCrusherRecorder,
  makeSureSetupIsCorrect,
} from "../../utils/setup";

const program = new Command();

program.addHelpText(
  "after",
  `
    Example call:
      $ crusher-cli test:create --help`
);

// // If custom help write code here
// if (process.argv.includes("-h")) {
//     console.log("Custom help")
//     process.exit()
// }

program
  .option("-p, --port <number>", "port number")
  .option("-t, --token <string>", "Crusher user token")
  .option("-pID, --projectID <string>", "Crusher project ID")
  .parse(process.argv);

export default class CommandBase {
  options;
  constructor() {
    this.options = program.opts();
    const { help, version } = this.options;

    this.run();
  }
  help() {
    console.log(`Create a new test`);
  }

  init() {
    this.options = program.opts();
    const { help, version } = this.options;
    if (help === true) {
      this.help();
      return;
    }
  }

  async run(): Promise<any> {
    this.init();
    const { token } = this.options;

    await loadUserInfoOnLoad({ token: token });
    await installCrusherRecorder();
    await makeSureSetupIsCorrect(this.options.projectID);

    await this.createTest(this.options);
  }

  async createTest(flags) {
    let tunnel: localTunnel.Tunnel | undefined;
    if (flags.port) {
      const port = flags.port;
      tunnel = await createTunnel(port);
      const host = tunnel.url;

      await cli.log("\nServing at " + host + " now \n");
    }

    const projectConfig = getProjectConfig();
    const userInfo = getUserInfo();
    if (process.platform === "darwin") {
      execSync(
        `${resolvePathToAppDirectory(
          'bin/"Crusher Recorder.app"/Contents/MacOS/"Crusher Recorder"'
        )} --no-sandbox --exit-on-save --projectId=${
          flags.projectID ? flags.projectID : projectConfig.project
        } --token=${ flags.token ? flags.token : userInfo?.token}`,
        { stdio: "ignore" }
      );
    } else {
      execSync(
        `${resolvePathToAppDirectory(
          "bin/electron-app"
        )} --no-sandbox --exit-on-save --projectId=${
          flags.projectID ? flags.projectID : projectConfig.project
        } --token=${flags.token ? flags.token : userInfo?.token}`,
        { stdio: "ignore" }
      );
    }

    cli.log("Created your test. Few command that might be helpful\n");
    cli.log("1.) Run all tests in your project");
    cli.log(`${chalk.hex("9A4AFF")(`npx crusher-cli test:run`)}`);

    cli.log("2.) Invite team members to the project");
    cli.log(`${chalk.hex("9A4AFF")(`npx crusher-cli invite`)}`);
  }
}
