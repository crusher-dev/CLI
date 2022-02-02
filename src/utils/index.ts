import { getAppConfig, isCrusherConfigured } from "../common/appConfig";
import { IUserInfo } from "../state/userInfo";
import cli from "cli-ux";
import * as path from "path";
import * as fs from "fs";

const getLoggedInUser = (): IUserInfo => {
    if(!isCrusherConfigured()) {
        throw cli.error("Crusher not configured yet. Try logging in first.");
    }
    const config = getAppConfig();
    if(!config.userInfo) {
       throw cli.error("No user logged in. Try logging in first.");
    }
    return config.userInfo;
};

const isUserLoggedIn = () => {
    if(!isCrusherConfigured()) {
        return false;
    }
    const config = getAppConfig();
    return !!config.userInfo;
};

function findGitRoot(_start = null) {
    let start: any = _start || process.cwd()
    if (typeof start === 'string') {
      if (start[start.length - 1] !== path.sep) {
        start += path.sep
      }
      start = path.normalize(start)
      start = start.split(path.sep)
    }
    if (!start.length) {
      throw new Error('.git/ not found in path')
    }
    start.pop()
    var dir = start.join(path.sep)
    var fullPath = path.join(dir, '.git')
    if (fs.existsSync(fullPath)) {
        if(!fs.lstatSync(fullPath).isDirectory()) {
        var content = fs.readFileSync(fullPath, { encoding: 'utf-8' })
        var match = /^gitdir: (.*)\s*$/.exec(content)
        if (match) {
          return path.normalize(match[1])
        }
      }
      return path.normalize(fullPath)
    } else {
      return findGitRoot(start)
    }
  }

export {getLoggedInUser, isUserLoggedIn, findGitRoot};