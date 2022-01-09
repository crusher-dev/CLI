// eslint-disable-next-line unicorn/filename-case
import * as fs from 'fs'
import {APP_DIRECTORY} from '../constants'
import {getUserInfo, setUserInfo} from '../state/userInfo'
import {createDirIfNotExist, resolvePathToAppDirectory} from '../utils'
import * as path from "path";

const PROJECT_CONFIG_FILE = path.resolve(process.cwd(), "./.crusher/config.json");

export const setProjectConfig = config => {
  createDirIfNotExist('.crusher')
  fs.writeFileSync(PROJECT_CONFIG_FILE, JSON.stringify(config))
}

export const getProjectConfig = () => {
  return fs.existsSync(PROJECT_CONFIG_FILE) ? JSON.parse(fs.readFileSync(PROJECT_CONFIG_FILE, 'utf8')) : null;
}
