import * as path from "path";

export const BACKEND_SERVER_URL = 'http://localhost:8000'
export const FRONTEND_SERVER_URL = 'http://localhost:3000'
export const APP_DIRECTORY = `${process.env.HOME}/.crusher`;

export const RECORDER_MAC_BUILD = "https://github.com/crusherdev/crusher-downloads/releases/download/v1.0.10/Crusher-Recorder-1.0.9.dmg";
export const RECORDER_LINUX_BUILd = "https://github.com/crusherdev/crusher-downloads/releases/download/v1.0.10/Crusher-Recorder-1.0.9_amd64.deb";

export const getRecorderBuildForPlatfrom = () => {
  if (process.platform === "linux") return { url: RECORDER_LINUX_BUILd, name: path.basename(RECORDER_LINUX_BUILd), platform: "linux", version: RECORDER_LINUX_BUILd.split("/").reverse()[1] }
  if (process.platform === "darwin") return { url: RECORDER_MAC_BUILD, name: path.basename(RECORDER_MAC_BUILD), platform: "mac", version: RECORDER_MAC_BUILD.split("/").reverse()[1] }

  throw new Error("Recorder not available for your platfrom yet");
}
