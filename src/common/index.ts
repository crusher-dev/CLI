import axios from 'axios'
import { cli } from 'cli-ux'
import { getUserInfo } from '../state/userInfo'
import {resolveBackendServerUrl} from '../utils'
import { getProjectConfig } from './projectConfig'

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

const getProjectsOfCurrentUser = async (): Promise<Array<{ id: number;  name: string}>> => {
  const currentUser = getUserInfo();
  const infoResponse = await axios.get(resolveBackendServerUrl('/users/actions/getUserAndSystemInfo'), {
    headers: {
      Cookie: `isLoggedIn=true; token=${currentUser?.token}`,
    },
  })
  const info = infoResponse.data

  return info.projects;
}

const runTests = async () => {
  const userInfo = getUserInfo();
  const projectConifg = getProjectConfig();

  await cli.action.start("Running tests now");
  await axios.post(resolveBackendServerUrl(`/projects/${projectConifg.project}/tests/actions/run`), {
    host: projectConifg.host || undefined,
  }, {
    headers: {
      Cookie: `isLoggedIn=true; token=${userInfo?.token}`,
    },
  }).catch((err) => {
    cli.error(err.response.data.message);
  });
  await cli.action.stop();
};

export {getUserInfoFromToken, getProjectsOfCurrentUser, runTests}
