import axios from 'axios'
import { cli } from 'cli-ux'
import { getUserInfo } from '../state/userInfo'
import {resolveBackendServerUrl, resolveFrontendServerUrl} from '../utils'
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

const runTests = async (host: string | undefined) => {
  const userInfo = getUserInfo();
  const projectConifg = getProjectConfig();

  await cli.action.start("Running tests now");

  try {
    const res = await axios.post(resolveBackendServerUrl(`/projects/${projectConifg.project}/tests/actions/run`), {
      host: host,
    }, {
      headers: {
        Cookie: `isLoggedIn=true; token=${userInfo?.token}`,
      },
    });

    await cli.action.stop();

    const buildInfo = res.data.buildInfo;
    const buildId = buildInfo.buildId;

    await cli.action.start("Waiting for tests to finish");
    // sleep for 20 seconds
    await new Promise(resolve => {
      // create a poll to check if tests are done
      const poll = setInterval(async () => {
        const res = await axios.get(resolveBackendServerUrl(`/projects/${projectConifg.project}/builds?buildId=${buildId}`), {
          headers: {
            Cookie: `isLoggedIn=true; token=${userInfo?.token}`,
          },
        });

        const buildInfo = res.data.list[0];
        if (buildInfo.status === 'PASSED' || buildInfo.status === "FAILED" || buildInfo.status === "MANUAL_REVIEW_REQUIRED") {
          clearInterval(poll);
          await cli.action.stop(buildInfo.status === 'PASSED' ? `Build passed in ${parseInt(buildInfo.duration)}s` : `Build failed in ${parseInt(buildInfo.duration)}s`);
          await cli.log("View build report at " + resolveFrontendServerUrl(`/app/build/${buildId}`));
          resolve(true);
        }
      }, 5000);
    });
  } catch (err: any) {
    await cli.action.stop(err.message);
  }
};

export {getUserInfoFromToken, getProjectsOfCurrentUser, runTests}
