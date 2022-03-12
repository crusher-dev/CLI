import { Command } from "commander";

import { cli } from "cli-ux";
import { runTests } from "../../utils/apiUtils";
import { getProjectConfig } from "../../utils/projectConfig";
import { loadUserInfoOnLoad } from "../../utils/hooks";
import { getUserInfo } from "../../state/userInfo";
import localTunnel from "localtunnel";
import { createTunnel } from "../../utils/setup";

const program = new Command();
program.addHelpText(
  "after",
  `
    Example call:
      $ custom-help --help`
);
program
  .option('-t, --token <string>', 'Use token to use')
  .option('-h, --host <string>', "Host to use")
  .parse(process.argv);

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

  async run(): Promise<any> {
    const options = program.opts();
    const { token } = options;

    await loadUserInfoOnLoad({ token });

    await this.makeSureSetupIsCorrect();
    await this.runTests(options);
  }

  async makeSureSetupIsCorrect() {
    const userInfo = getUserInfo();
    const projectConfig = getProjectConfig();

    if (!projectConfig)
      throw new Error(
        "Crusher not intialized in this repo. Run 'crusher-cli init' to initialize."
      );
  }

  async runTests(flags) {
    const projectConfig = getProjectConfig();
    let host: string | undefined = flags.host ? flags.host : undefined;
    let tunnel: localTunnel.Tunnel | undefined;
    if (projectConfig.hostEnvironment === "local" || flags.port) {
      const port = flags.port ? flags.port : projectConfig.port;
      tunnel = await createTunnel(port);
      host = tunnel.url;

      await cli.log("Serving at " + host + " now");
    }
    try {
      await runTests(host);
    } catch (err) {
    } finally {
      if (tunnel!) {
        tunnel!.close();
      }
    }
  }
}
