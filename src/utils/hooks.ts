import { getUserInfoFromToken } from "./apiUtils";
import { getAppConfig, initializeAppConfig, setAppConfig } from "./appConfig";
import { getUserInfo, setUserInfo } from "../state/userInfo";
import {
  resolveBackendServerUrl,
  resolveFrontendServerUrl,
} from "../utils/utils";
import axios from "axios";
import cli from "cli-ux";
import fastify from "fastify";
<<<<<<< HEAD
=======
import { alias } from "./analytics";
>>>>>>> d7790a8d994b5cb3b69aaa1802d6c9f6cad4f3a6

const fast = fastify({ logger: false });

const waitForUserLogin = async (): Promise<string> => {
  const loginKey = await axios
    .get(resolveBackendServerUrl("/cli/get.key"))
    .then((res) => {
      return res.data.loginKey;
    });
  await cli.log(
    "Login or create an account to create a test⚡⚡. Opening a browser for you.\nIf it doesn't open, open this link:"
  );
  await cli.log(resolveFrontendServerUrl(`/?lK=${loginKey}`));

  await cli.action.start("Waiting for login");

  await cli
    .open(`${resolveFrontendServerUrl(`/?lK=${loginKey}`)}`)
    .catch((err) => {
      console.error(err);
    });

  const token = await new Promise((resolve) => {
    const interval = setInterval(async () => {
      const loginKeyStatus = await axios
        .get(resolveBackendServerUrl(`/cli/status.key?loginKey=${loginKey}`))
        .then((res) => res.data);
      if (loginKeyStatus.status === "Validated") {
        clearInterval(interval);
        resolve(loginKeyStatus.userToken);
      }
<<<<<<< HEAD
    }, 5000);
=======
    }, 1000);
>>>>>>> d7790a8d994b5cb3b69aaa1802d6c9f6cad4f3a6
  });

  await cli.action.stop();

  await cli.log("\nLogin completed! Let's ship high quality software fast⚡⚡");
  return token as string;
};

const loadUserInfoOnLoad = async function (options: { token?: string }) {
  initializeAppConfig();

  if (options.token) {
    // Verify the new token and save it if valid
    try {
      await getUserInfoFromToken(options.token).then((userInfo) => {
        setUserInfo(userInfo);
      });
    } catch (e) {
      const userToken = await waitForUserLogin();
      await getUserInfoFromToken(userToken).then((userInfo) => {
        setUserInfo(userInfo);
      });
    }
  } else {
    const appConfig = getAppConfig();
    // Login user to set default auth token
    if (!appConfig.userInfo || !appConfig.userInfo.token) {
      const userToken = await waitForUserLogin();
<<<<<<< HEAD
      await getUserInfoFromToken(userToken).then((userInfo) => {
=======

      await getUserInfoFromToken(userToken).then((userInfo) => {
        const { id } = userInfo;
        alias(id);

>>>>>>> d7790a8d994b5cb3b69aaa1802d6c9f6cad4f3a6
        setUserInfo(userInfo);
        setAppConfig({
          ...getAppConfig(),
          userInfo: getUserInfo(),
        });
      });
    }
  }
};

export { loadUserInfoOnLoad };
