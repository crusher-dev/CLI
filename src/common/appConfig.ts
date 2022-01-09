// eslint-disable-next-line unicorn/filename-case
import * as fs from 'fs'
import {APP_DIRECTORY} from '../constants'
import {getUserInfo, setUserInfo} from '../state/userInfo'
import {resolvePathToAppDirectory} from '../utils'

const CRUSHER_CONFIG_FILE = resolvePathToAppDirectory('crusher.json')

export const initializeAppConfig = () => {
  if (!fs.existsSync(APP_DIRECTORY)) {
    fs.mkdirSync(APP_DIRECTORY)
    fs.mkdirSync(resolvePathToAppDirectory("bin"));
    setAppConfig({})
  } else {
    // Populate the app state
    const config = getAppConfig()
    setUserInfo(config.userInfo)
  }
}

export const setAppConfig = config => {
  fs.writeFileSync(CRUSHER_CONFIG_FILE, JSON.stringify(config))
}

export const getAppConfig = () => {
  return JSON.parse(fs.readFileSync(CRUSHER_CONFIG_FILE, 'utf8'))
}
