// eslint-disable-next-line unicorn/filename-case
import * as fs from "fs";
import { APP_DIRECTORY, recorderVersion } from "../constants";
import { setUserInfo } from "../state/userInfo";
import {
  ensureDirectoryExistence,
  resolvePathToAppDirectory,
} from "../utils/utils";
import * as path from "path";
var uuid = require("uuid");

const CRUSHER_CONFIG_FILE = resolvePathToAppDirectory("crusher.json");

export const initializeAppConfig = () => {
  if (!fs.existsSync(APP_DIRECTORY)) {
    fs.mkdirSync(APP_DIRECTORY);
    fs.mkdirSync(resolvePathToAppDirectory("bin"));
  }

  if (!fs.existsSync(path.resolve(APP_DIRECTORY, "crusher.json"))) {
    setAppConfig({ recorderVersion: recorderVersion });
  }

  const config = getAppConfig();
  setUserInfo(config.userInfo);
};


export const setAppConfig = (config) => {
  ensureDirectoryExistence(CRUSHER_CONFIG_FILE);

  fs.writeFileSync(CRUSHER_CONFIG_FILE, JSON.stringify(config));
};

export const getAppConfig = () => {
  return isCrusherConfigured()
    ? JSON.parse(fs.readFileSync(CRUSHER_CONFIG_FILE, "utf8"))
    : null;
};

export const isCrusherConfigured = () => {
  return fs.existsSync(CRUSHER_CONFIG_FILE);
};

const setMachineID = (machineId) => {
  const appConfig = getAppConfig();
  if (
    appConfig == null ||
    (typeof (appConfig === "object") && Object.keys(appConfig).length < 1)
  ) {
    setAppConfig({ machineId });
  } else {
    setAppConfig({
      ...appConfig,
      machineId,
    });
  }
};

export const getMachineUUID = () => {
  const isMachineIDNotSet =
    getAppConfig() === null || getAppConfig()?.machineId === undefined;

  if (isMachineIDNotSet) {
    const uniqueMachineId = uuid.v4();
    setMachineID(uniqueMachineId);
  }

  return getAppConfig().machineId;
};
