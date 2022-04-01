import { Command } from "commander";
import { runTests } from "../../utils/apiUtils";
import { getProjectConfig } from "../../utils/projectConfig";
import { loadUserInfoOnLoad } from "../../utils/hooks";
import { getUserInfo } from "../../state/userInfo";

import { Cloudflare } from "../../module/cloudflare";

const program = new Command();
program.addHelpText(
	"after",
	`
    Example call:
      $ custom-help --help`,
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

		if (!projectConfig) throw new Error("Crusher not intialized in this repo. Run 'crusher-cli init' to initialize.");
	}

	async runTests(flags) {
		const projectConfig = getProjectConfig();
		let host: string | undefined = undefined;

		if (!!projectConfig.proxy && projectConfig.proxy.length > 0) {
			await Cloudflare.runTunnel();
		}

		try {
			await runTests(host);
		} catch (err) {
		} finally {
		}
	}
}
