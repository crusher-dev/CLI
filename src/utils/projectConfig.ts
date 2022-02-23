// eslint-disable-next-line unicorn/filename-case
import * as fs from 'fs'
import {APP_DIRECTORY} from '../constants'
import {createDirIfNotExist} from '../utils/utils'
import * as path from "path";

function findCrusherProjectConfig(_start = null) {
  let start: any = _start || process.cwd()
  if (typeof start === 'string') {
    if (start[start.length - 1] !== path.sep) {
      start += path.sep
    }
    start = path.normalize(start)
    start = start.split(path.sep)
  }
  if (!start.length) {
    return null
  }
  start.pop()
  const dir = start.join(path.sep)
  const fullPath = path.join(dir, '.crusher')
  if (fs.existsSync(fullPath) && path.resolve(fullPath) !== path.resolve(APP_DIRECTORY)) {

    if (fs.lstatSync(fullPath).isDirectory()) {

      return path.normalize(fullPath)
    }
  }
  return findCrusherProjectConfig(start)
}

const PROJECT_CONFIG_PATH = path.resolve(process.cwd(), '.crusher');

export const setProjectConfig = config => {
    createDirIfNotExist('.crusher')
    fs.writeFileSync(path.resolve(PROJECT_CONFIG_PATH, "./config.json"), JSON.stringify(config))
}

export const getProjectConfig = () => {
  const existingProjectConfig = findCrusherProjectConfig();

  const configPath = existingProjectConfig || PROJECT_CONFIG_PATH;

  return fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(path.resolve(configPath, "./config.json"), 'utf8')) : null;
}