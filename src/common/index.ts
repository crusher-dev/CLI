import axios from 'axios'
import {getUserInfo, setUserInfo} from '../state/userInfo'
import {resolveBackendServerUrl} from '../utils'
import * as fs from "fs";
import { getAppConfig, setAppConfig } from './appConfig';

const getUserInfoFromToken = async (token: string) => {
  // call axios request with token as cookie header
  const infoResponse = await axios.get(resolveBackendServerUrl('/users/actions/getUserAndSystemInfo'), {
    headers: {
      Cookie: `isLoggedIn=true; token=${token}`,
    },
  })

  const info = infoResponse.data
  if (!info.isUserLoggedIn) throw new Error('Invalid user authentication. Login again using `npx crusher login` to fix this')

  return {
    id: info.userData.userId,
    name: info.userData.name,
    email: info.userData.email,
    token: token,
  };
}

export {getUserInfoFromToken}