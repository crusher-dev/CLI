import {Command, flags} from '@oclif/command'
import { extractRepoFullName, getBackendServerUrl, getGitBranchName, getGitLastCommitSHA, getGitRepos } from '../utils';
import Setup from './setup';
const {cli} = require('cli-ux')
const fetch = require('node-fetch');

export default class Run extends Command {
  static description = 'Run visual diff'

  static examples = [
    `$  crusher run --crusher_token=123 --test_ids=32 -t\n` +
    `$  crusher run --crusher_token=123 --test_ids=32 --base_url=http://google.com`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    crusher_token: flags.string({description: 'Token from your crusher-cli-macos app', required: true}),
    base_url: flags.string({description: 'base_url, Not required with tunnelling'}),
    test_ids: flags.string({description: 'IDs of test you want to run [Optional]'}),
    project_id: flags.string({description: 'Project ID'}),
    tunnel: flags.boolean({char: 't', description: 'Enable tunneling for remote machine'}),
  }

  async run() {
    const { flags} = this.parse(Run);
    const {base_url, test_ids, project_id, crusher_token, tunnel} = flags;

    if (typeof (test_ids) === 'undefined' && typeof (project_id) === 'undefined') {
      console.log('Either test ID or Test Group IDs are needed to run the test.')
      return
    }

    if (typeof (base_url) === 'undefined' && !tunnel) {
      console.log('Please enter base url or use tunnelling')
    }

    await cli.action.start('Starting visual test')
    await new Promise(r => setTimeout(r, 1000))

    if (tunnel) {
      await cli.action.start('Creating local tunnel')
      await new Promise(r => setTimeout(r, 1000))
    }

    const gitSha = await getGitLastCommitSHA();
    const gitBranchName = await getGitBranchName();
    const gitRepos : any = await getGitRepos();

    const firstRepoName = (Object.values(gitRepos)[0] as any).fetch;
    if(project_id && !test_ids) {
      //@ts-ignore

      const response = await fetch(`${getBackendServerUrl()}/projects/runTests/${project_id}`, {
        method: "POST",
        headers: {				Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',},
        body: JSON.stringify({
          cliToken: crusher_token,
          host: base_url,
          branchName: gitBranchName,
          commitId: gitSha,
          repoName: await extractRepoFullName(firstRepoName)
        })}).then(res => res.json());
      if(response && response.status === "RUNNING_TESTS"){
        console.log("Test have started running");
      } else {
        console.error("Something went wrong while running tests");
      }
    } else if(project_id && test_ids){
      //@ts-ignore
      const response = await fetch(`${getBackendServerUrl()}/projects/runTestWithIds`, {method: "POST", headers: {				Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'}, body: JSON.stringify({
            cliToken: crusher_token,
          host: base_url,
          projectId: project_id,
          test_ids,
          branchName: gitBranchName,
          commitId: gitSha,
          repoName: firstRepoName
          })}).then(res => res.json());
      if(response && response.status === "RUNNING_TESTS"){
        console.log("Test have started running");
      } else {
        console.error("Something went wrong while running tests");
      }
    }

    await cli.action.stop()
  }
}
