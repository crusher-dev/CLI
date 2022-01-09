import { getUserInfoFromToken } from "../common";
import { getAppConfig, initializeAppConfig, setAppConfig } from "../common/appConfig";
import { getUserInfo, setUserInfo } from "../state/userInfo";
import { getBackendServerUrl, getFrontendServerUrl, getUniqueString, resolveBackendServerUrl, resolvePathToAppDirectory } from "../utils";
import axios from 'axios';
import cli from 'cli-ux'

const waitForUserLogin = async(): Promise<string> => {
  const randomGeneratedToken = getUniqueString();
  await cli.action.start(
    'Please login/signup on crusher. Opening in browser',
  )
  
  await axios.get(`${getBackendServerUrl()}/cli/add_token/${randomGeneratedToken}`);

  await new Promise(r => setTimeout(r, 2000))
  await cli.open(
    `${getFrontendServerUrl()}?cli_token=${randomGeneratedToken}`,
  )

  let userLoginCheckInterval: any = null;
  const cliStatusInfo = await new Promise(resolve => {
    const userLoginCheckIntervalHandler = async (): Promise<any> => {
      const cliStatusResponse = await axios.get(`/cli/status/${randomGeneratedToken}`);
      cliStatusResponse.data.status === 'Completed' && resolve(cliStatusResponse.data)
    }

    userLoginCheckInterval = setInterval(userLoginCheckIntervalHandler, 2500)
  }) as any;

  // Clean-up
  if(userLoginCheckInterval) {
    clearInterval(userLoginCheckInterval);
    userLoginCheckInterval = null;
  }

  await cli.action.stop();

  return cliStatusInfo.requestToken;
};

const initHook = async function (options: { token?: string; }) {
  initializeAppConfig();
  if(options.token) {
      // Verify the new token and save it if valid
      try {
        await getUserInfoFromToken(options.token).then((userInfo) => {
            setUserInfo(userInfo);
        });
      } catch(e) {
        const userToken = await waitForUserLogin();
        await getUserInfoFromToken(userToken).then((userInfo) => {
          setUserInfo(userInfo);
      });    
    } else {
      const appConfig = getAppConfig();

      // Login user to set default auth token
      if(!appConfig.userData || !appConfig.userData.token) {
        const userToken = await waitForUserLogin();
        await getUserInfoFromToken(userToken).then((userInfo) => {
          setUserInfo(userInfo);
        });
      }
    }
  }

  setAppConfig({
      ...getAppConfig(),
      userInfo: getUserInfo(),
  });
}

export { initHook };