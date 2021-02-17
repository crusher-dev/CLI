import {Command, flags} from '@oclif/command'
import {
  getBackendServerUrl,
  getFrontendServerUrl,
  getUniqueString,
} from '../utils'

import {prompt} from 'enquirer'
import {cli} from 'cli-ux'
import fetch  from 'node-fetch'

export default class Setup extends Command {
  static description = 'Generate command to run test';

  static userLoginCheckInterval: any = null;

  static examples = [
    `Generate config for running commands
    `,
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };

  static userLoginCheckPoll: any = null;

  static randomGeneratedToken = getUniqueString();

  static userData: any = null;

  static waitForUserLogin = (): Promise<string> => {
    return new Promise(resolve => {
      const userLoginCheckPoll = async (): Promise<any> => {
        const response = await fetch(
          `${getBackendServerUrl()}/cli/status/${Setup.randomGeneratedToken}`,
        ).then(res => res.json())
        response.status === 'Completed' && resolve(response)
      }

      Setup.userLoginCheckPoll = setInterval(userLoginCheckPoll, 2500)
    })
  };

  static registerToken = () => {
    return fetch(
      `${getBackendServerUrl()}/cli/add_token/${Setup.randomGeneratedToken}`,
    )
  };

  async userLogin() {
    await cli.action.start(
      'Please login/signup on crusher. Opening in browser',
    )
    await Setup.registerToken()
    await new Promise(r => setTimeout(r, 2000))
    await cli.open(
      `${getFrontendServerUrl()}?cli_token=${Setup.randomGeneratedToken}`,
    )
    // eslint-disable-next-line require-atomic-updates
    Setup.userData = await Setup.waitForUserLogin()

    await cli.action.stop()

    if (Setup.userLoginCheckPoll) {
      clearInterval(Setup.userLoginCheckPoll)
      // eslint-disable-next-line require-atomic-updates
      Setup.userLoginCheckPoll = null
    }
    return `--crusher_token=${Setup.userData.requestToken}`
  }

  async selectTests() {
    const choices = Setup.userData.projects.map(project => ({
      name: project.name,
      value: project.id,
    }))

    const selectedProjectOption = (
      await prompt([{
        type: 'select',
        name: 'selectedProject',
        initial: 'N',
        message: 'Select project',
        choices,
        result(names: any) {
          return this.map(names)
        },
      }])
    ).selectedProject

    const selectedProjectId =
      selectedProjectOption[Object.keys(selectedProjectOption)[0]]
    const selectedProject = Setup.userData.projects.find(
      project => project.id === selectedProjectId,
    )

    const {shouldRunIndividualTest} = await prompt({
      type: 'confirm',
      initial: 'N',
      name: 'shouldRunIndividualTest',
      message: 'Do you want to run individual test?',
    })

    if (shouldRunIndividualTest) {
      const {projectTestList} = selectedProject

      if (projectTestList.length === 0) {
        console.log('Please add test in project.')
        return
      }

      const selectTestOptionPromptResponse = await prompt([{
        type: 'multiselect',
        name: 'selectTestOption',
        message: 'Select Test Group IDs',
        choices: selectedProject.projectTestList.map(test => ({
          name: test.name,
          value: test.id,
        })),
        result(value: any) {
          return this.map(value)
        },
      }])

      const selectTestOption = selectTestOptionPromptResponse.selectTestOption

      const testIds = Object.keys(selectTestOption).map(key => {
        return selectTestOption[key]
      })

      if (testIds.length === 0) {
        console.log('Please select tests')
        return
      }
      return `--test_ids=${testIds.join(',')}`
    }

    return `--project_id=${selectedProjectId}`
  }

  async runLocally() {
    const {shouldRunLocally} = await prompt({
      type: 'confirm',
      name: 'shouldRunLocally',
      message: 'Do you to want to run test on port? (For CI/ Local Development)',
    })

    // If not ask for base host
    if (!shouldRunLocally) {
      const {host} = await prompt({
        type: 'input',
        name: 'host',
        message: 'Change base Host (Skip if No)',
      })
      if (host.trim() !== '') {
        return `--base_url=${host}`
      }
      return ''
    }

    // Ask for port
    const {port} = await prompt({
      type: 'input',
      name: 'port',
      message: 'Port on which service is exposed',
    })
    if (port.trim() !== '') {
      return `-t --port=${port}`
    }
    return '-t'
  }

  async run() {
    const crusherTokenFlag = await this.userLogin()
    const testIDsFlag = await this.selectTests()
    const hostParamFlag = await this.runLocally()
    const generatedCommand = `npx crusher-cli run ${testIDsFlag} ${hostParamFlag} ${crusherTokenFlag} `

    console.log('\nPlease use following command to run test\n')
    console.log(generatedCommand)
  }
}
