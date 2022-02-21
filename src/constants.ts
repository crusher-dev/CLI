import * as path from "path";
import { getRuntimeEnv } from "./utils";

export const BACKEND_SERVER_URL = 'https://backend.crusher.dev'
export const FRONTEND_SERVER_URL = 'https://app.crusher.dev'

export const APP_DIRECTORY = getRuntimeEnv().CRUSHER_GLOBAL_DIR || `/${getRuntimeEnv().HOME}/.crusher`;

export const RECORDER_MAC_BUILD = "https://github.com/crusherdev/crusher-downloads/releases/download/v1.0.11/Crusher.Recorder-1.0.11-mac.zip";
export const RECORDER_LINUX_BUILd = "https://github.com/crusherdev/crusher-downloads/releases/download/v1.0.11/Crusher.Recorder-1.0.11-linux.zip";

export const getRecorderBuildForPlatfrom = () => {
  if (process.platform === "linux") return { url: RECORDER_LINUX_BUILd, name: path.basename(RECORDER_LINUX_BUILd), platform: "linux", version: RECORDER_LINUX_BUILd.split("/").reverse()[1] }
  if (process.platform === "darwin") return { url: RECORDER_MAC_BUILD, name: path.basename(RECORDER_MAC_BUILD), platform: "mac", version: RECORDER_MAC_BUILD.split("/").reverse()[1] }

  throw new Error("Recorder not available for your platfrom yet");
}
