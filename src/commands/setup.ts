import {Command, flags} from '@oclif/command'
import {getBackendServerUrl, getFrontendServerUrl, getUniqueString} from "../utils";
import base = Mocha.reporters.base;
const {cli} = require('cli-ux')
const fetch = require('node-fetch');
const { prompt,MultiSelect,Confirm } = require('enquirer');

export default class Setup extends Command {
  static description = 'Run visual diff'

  static userLoginCheckInterval: any = null;

  static examples = [
    `Generate config for running commands
    `,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static userLoginCheckPoll: any = null;

  static randomGeneratedToken = getUniqueString();
  static userData:any = null;

  static waitForUserLogin = ():Promise<string> => {
    return new Promise((resolve,reject) => {
       const userLoginCheckPoll = async () : Promise<any> => {
         // console.log(getBackendServerUrl());
        const response = await fetch(`${getBackendServerUrl()}/cli/status/${Setup.randomGeneratedToken}`).then(res => res.json());
        response.status==='Completed' && resolve(response);
      }

      Setup.userLoginCheckPoll = setInterval(userLoginCheckPoll, 2500)
    })
  }

  static registerToken =  ()=>{
    return fetch(`${getBackendServerUrl()}/cli/add_token/${Setup.randomGeneratedToken}`)
  }

  async userLogin() {
    await cli.action.start('Opening a browser to login. Please complete that process.')
    await Setup.registerToken()
    await new Promise(r => setTimeout(r, 500))
    await cli.open(`${getFrontendServerUrl()}?cli_token=${Setup.randomGeneratedToken}`)
    Setup.userData =  await Setup.waitForUserLogin();
    await cli.action.stop();
    if(Setup.userLoginCheckPoll){
      clearInterval(Setup.userLoginCheckPoll);
      Setup.userLoginCheckPoll = null;
    }

    return  `--crusher_token=${Setup.userData.requestToken}`;
  }

  async selectTests() {
    const choices = Setup.userData.projects.map(project=> ({name: project.name, value: project.id}));

    const selectedProjectOption = (await prompt({
      type: 'select',
      name: 'selectedProject',
      initial: 'N',
      message: 'Select the project to run test on?',
      choices,
      result(names:any) {
        return this.map(names);
      }
    })).selectedProject;

    const selectedProjectId = selectedProjectOption[Object.keys(selectedProjectOption)[0]];
    const selectedProject = Setup.userData.projects.find((project) => project.id === selectedProjectId);
    const {shouldRunIndividualTest} = await prompt({type: 'confirm', initial: 'N', name: 'shouldRunIndividualTest', message: 'Do you want to run individual test?'})
    if (shouldRunIndividualTest) {
      const {projectTestList} = selectedProject;

      if(projectTestList.length<1){
        console.log("Please add test in project.")
        return;
      }

      const selectTestOptionPropmpt = new MultiSelect({
        name: 'selectTestOption',
        message: 'Select Test Group Ids',
        choices: selectedProject.projectTestList.map(test=> ({name: test.name, value: test.id})),
        result(value:any) {
          return this.map(value);
        }
      });

      const selectTestOption =  await selectTestOptionPropmpt.run();


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
    const {shouldRunLocally} = await prompt({type: 'confirm', name: 'shouldRunLocally', message:'Do you run test for locally hosted website?'})
    // If not ask for base host
    if (!shouldRunLocally) {
      const {host} = await prompt({type: 'input', name: 'host', message: 'Override Host (Skip if No)'});
      if(host.trim() != '') {
        return `--base_url=${host}`
      } else {
        return '';
      }
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
