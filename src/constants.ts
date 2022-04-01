import * as path from "path";
import { getRuntimeEnv } from "./utils/utils";

export const BACKEND_SERVER_URL = "https://backend.crusher.dev";
export const FRONTEND_SERVER_URL = "https://app.crusher.dev";

export const APP_DIRECTORY =
<<<<<<< HEAD
  getRuntimeEnv().CRUSHER_GLOBAL_DIR ||
  `/${getRuntimeEnv().HOME}/.crusher`;
=======
  getRuntimeEnv().CRUSHER_GLOBAL_DIR || `/${getRuntimeEnv().HOME}/.crusher`;
>>>>>>> d7790a8d994b5cb3b69aaa1802d6c9f6cad4f3a6

export const recorderVersion = `1.0.14`;

export const RECORDER_MAC_BUILD = `https://github.com/crusherdev/crusher-downloads/releases/download/v${recorderVersion}/Crusher.Recorder-${recorderVersion}-mac.zip`;
export const RECORDER_LINUX_BUILd = `https://github.com/crusherdev/crusher-downloads/releases/download/v${recorderVersion}/Crusher.Recorder-${recorderVersion}-linux.zip`;


export const CLOUDFLARED_URL = {
  MAC: "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz",
  LINUX: "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
}
export const getRecorderBuildForPlatfrom = () => {
  if (process.platform === "linux")
    return {
      url: RECORDER_LINUX_BUILd,
      name: path.basename(RECORDER_LINUX_BUILd),
      platform: "linux",
      version: RECORDER_LINUX_BUILd.split("/").reverse()[1],
    };
  if (process.platform === "darwin")
    return {
      url: RECORDER_MAC_BUILD,
      name: path.basename(RECORDER_MAC_BUILD),
      platform: "mac",
      version: RECORDER_MAC_BUILD.split("/").reverse()[1],
    };

  throw new Error("Recorder not available for your platfrom yet");
};
