import {Command, flags} from '@oclif/command'
import {getBackendServerUrl, getFrontendServerUrl, getUniqueString} from "../utils";
const {cli} = require('cli-ux')
const fetch = require('node-fetch');
const { prompt,MultiSelect } = require('enquirer');

export default class Setup extends Command {
  static description = 'Run visual diff'

  static examples = [
    `Generate config for running commands
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static randomGeneratedToken = getUniqueString();
  static userData:any = null;

  static waitForUserLogin = ():Promise<string> => {
    return new Promise((resolve,reject) => {
      const userLoginCheckPoll = async () : Promise<any> => {
        const response = await fetch(`${getBackendServerUrl()}/cli/status/${Setup.randomGeneratedToken}`).then(res => res.json());
        response.status==='Completed' && resolve(response);
      }

      setInterval(userLoginCheckPoll, 2500)
    })
  }

  static registerToken =  ()=>{
    return fetch(`${getBackendServerUrl()}/cli/add_token/${Setup.randomGeneratedToken}`)
  }

  async userLogin() {
    await cli.action.start('Opening a browser to login. Please complete that process.')
    await Setup.registerToken()
    await new Promise(r => setTimeout(r, 500))
    await cli.open(`${getFrontendServerUrl()}/?cli_token=${Setup.randomGeneratedToken}`)
    Setup.userData =  await Setup.waitForUserLogin();
    await cli.action.stop();

    return  `--crusher_token=${Setup.userData.requestToken}`;
  }

  async selectTests() {
    const choices = Setup.userData.projects.map(project=> ({name: project.name, value: project.id}));

    const selectedProjectOption = (await prompt({
      type: 'select',
      name: 'selectedProject',
      initial: 'N',
      message: 'Select Environment for the PR?',
      choices,
      result(names) {
        return this.map(names);
      }
    })).selectedProject;

    const selectedProjectId = selectedProjectOption[Object.keys(selectedProjectOption)[0]];
    const selectedProject = Setup.userData.projects.find((project) => project.id === selectedProjectId);
    const runIndividualTest = await cli.confirm('Do you want to run individual test? [y/n]')

    if (runIndividualTest) {
      const {projectTestList} = selectedProject;

      if(projectTestList.length<1){
        console.log("Please add test in project.")
        return;
      }

      const selectTestOption = new MultiSelect({
        name: 'selectTestOption',
        message: 'Select Test Group Ids',
        choices: selectedProject.projectTestList.map(test=> ({name: test.name, value: test.id})),
        result(value) {
          return this.map(value);
        }
      }).selectTestOption;

      const testIds = Object.keys(selectTestOption).map((key)=>{
        return selectTestOption[key]
      })

      if(testIds.length<1){
        console.log("Please select some tests")
        return;
      }
       return `--test_ids=${testIds.join(',')}`
    }

     return `--project_id=${selectedProjectId}`
  }

  async runLocally() {
    const runLocal = await cli.confirm('Do you run test for locally hosted website? [y/n]')
    // If not ask for base host
    if (!runLocal) {
      const baseHost = await cli.prompt('Base Host (https://google.com)');
      return `--base_url=${baseHost}`
    }
    return ' -t'
  }

  async run() {
    const crusherTokenFlag = await this.userLogin()
    const testIDsFlag = await this.selectTests()
    const hostParamFlag = await this.runLocally()
    const generatedCommand = `./bin/run run ${testIDsFlag} ${hostParamFlag} ${crusherTokenFlag} `

    console.log('\n\n 💁💁 Please use following command to run test\n\n')
    console.log(generatedCommand)
  }
}
