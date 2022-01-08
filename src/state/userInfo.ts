// eslint-disable-next-line unicorn/filename-case

import { getAppConfig } from "../utils";

export interface IUserInfo {
  id: number;
  email: string;
  name: string;
  token: string;
}

const appConfig = getAppConfig()

let userInfo: IUserInfo | null = appConfig ? appConfig.userInfo : null

const setUserInfo = (_userInfo: IUserInfo) => {
  userInfo = _userInfo
}

const getUserInfo = () => {
  return userInfo
}

export {setUserInfo, getUserInfo}
