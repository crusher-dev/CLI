import { execSync } from "child_process";
import EntryCommand from "../commands/index";
import { loadUserInfoOnLoad } from "../utils/hooks";
import { getProjectConfig, getProjectConfigPath } from "../utils/projectConfig";
import { installCrusherRecorder } from "../utils/setup";
import { resolvePathToAppDirectory } from "../utils/utils";

const nodeVersion = process.version.match(/^v(\d+\.\d+)/)[1];

if (parseFloat(nodeVersion) >= 10.0) {
  const args = process.argv.slice(2);
  const helpArgs = ["-h", "--h", "help", "--help", "-help"];

  if (args.length === 0 || helpArgs.includes(args[0])) {
    // console.log("Choose a command to run");
    // new EntryCommand().help();

    new Promise(async() => {
      // @Todo: Add support for flag token here
      await loadUserInfoOnLoad({token: undefined});
      await installCrusherRecorder();
      const projectConfigPath = getProjectConfigPath();
      const projectConfig = getProjectConfig();
      
      const customFlags = projectConfig && projectConfig.project ? `--project-config-file=${projectConfigPath} --projectId=${projectConfig.project}` : "";

      if (process.platform === "darwin") {
        // `/Users/utkarsh/Desktop/crusher/new-crusher/packages/electron-app/bin/darwin-x64/Electron.app/Contents/MacOS/Electron /Users/utkarsh/Desktop/crusher/new-crusher/output/crusher-electron-app` ||
        const binPath = resolvePathToAppDirectory(
          'bin/"Crusher Recorder.app"/Contents/MacOS/"Crusher Recorder"'
        );

        console.log("Custom flags are", customFlags);
        execSync(
          `${binPath} ${customFlags} --no-sandbox`,
          { stdio: "ignore" }
        );
      } else {
        execSync(
          `${resolvePathToAppDirectory(
            "bin/electron-app"
          )} ${customFlags} --no-sandbox`,
          { stdio: "ignore" }
        );
      }
      
    })

  } else {
    new EntryCommand().run();
  }

} else {
  console.error(
    "Node version must be >= 10.0.0. You are using version: " +
    nodeVersion
  );
}
