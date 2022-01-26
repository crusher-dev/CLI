import {getUserInfoFromToken} from '../common'
import {getAppConfig, initializeAppConfig, setAppConfig} from '../common/appConfig'
import {getUserInfo, setUserInfo} from '../state/userInfo'
import {getBackendServerUrl, getFrontendServerUrl, getUniqueString, resolveBackendServerUrl, resolveFrontendServerUrl} from '../utils'
import axios from 'axios'
import cli from 'cli-ux'
import fastify from 'fastify'
import {getProjectConfig} from '../common/projectConfig'

const fast = fastify({logger: false})

const waitForUserLogin = async (): Promise<string> => {
  const loginKey = await axios.get(resolveBackendServerUrl('/cli/get.key')).then(res => {
    return res.data.loginKey
  })
  await cli.log('Please login/signup on crusher. Opening this link', resolveFrontendServerUrl(`/?loginKey=${loginKey}`))

  await cli.action.start(
    'Waiting for login',
  )

  await cli.open(
    `${resolveFrontendServerUrl(`/?loginKey=${loginKey}`)}`,
  ).catch(err => {
    console.error(err)
  })

  const token = await new Promise(resolve => {
    const interval = setInterval(async () => {
      const loginKeyStatus = await axios.get(resolveBackendServerUrl(`/cli/status.key?loginKey=${loginKey}`)).then(res => res.data)
      if (loginKeyStatus.status === 'Validated') {
        clearInterval(interval)
        resolve(loginKeyStatus.userToken)
      }
    }, 5000)
  })

  await cli.action.stop()
  return token as string
}

const initHook = async function (options: { token?: string; }) {
  initializeAppConfig()
  const projectConfig = getProjectConfig()

  if (projectConfig && projectConfig.userInfo) {
    // cli.log("Using the crusher config in the project");

    setAppConfig({
      ...getAppConfig(),
      ...getProjectConfig(),
    })
  }

  if (options.token) {
    // Verify the new token and save it if valid
    try {
      await getUserInfoFromToken(options.token).then(userInfo => {
        setUserInfo(userInfo)
      })
    } catch (e) {
      const userToken = await waitForUserLogin()
      await getUserInfoFromToken(userToken).then(userInfo => {
        setUserInfo(userInfo)
      })
    }
  } else {
    const appConfig = getAppConfig()

    // Login user to set default auth token
    if (!appConfig.userInfo || !appConfig.userInfo.token) {
      const userToken = await waitForUserLogin()
      await getUserInfoFromToken(userToken).then(userInfo => {
        setUserInfo(userInfo)
        setAppConfig({
          ...getAppConfig(),
          userInfo: getUserInfo(),
        })
      })
    }
  }
}

export {initHook}
