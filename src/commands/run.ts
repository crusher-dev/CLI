/* tslint:disable */ 
import {Command, flags} from '@oclif/command'

import {
  extractRepoFullName,
  getBackendServerUrl,
  getGitBranchName,
  getGitLastCommitSHA,
  getGitRepos,
  getLastCommitName,
  isFromGithub,
} from '../utils'
import cli from 'cli-ux'
import fetch from 'node-fetch'
import * as url from 'url'
import * as localTunnel from 'localtunnel'

export default class Run extends Command {
  static description = 'Run visual diff';

  static examples = [
    '$  crusher run --crusher_token=123 --test_ids=32 -t\n' +
      '$  crusher run --crusher_token=123 --test_ids=32 --base_url=http://google.com',
  ];

  static flags = {
    help: flags.help({char: 'h'}),
    crusher_token: flags.string({
      description: 'Token from your crusher-cli',
      required: true,
    }),
    base_url: flags.string({
      description: 'base_url, Not required with tunnelling',
    }),
    test_ids: flags.string({
      description: 'IDs of test you want to run [Optional]',
    }),
    project_id: flags.string({description: 'Project ID'}),
    endpoint: flags.string({
      description: 'Endpoint of the crusher server [Optional][Debugging]',
    }),
    tunnel: flags.boolean({
      char: 't',
      description: 'Enable tunneling for remote machine',
    }),
    port: flags.string({description: 'Port for tunnelling to work'}),
  };

  async run() {
    const {flags} = this.parse(Run)
    const {
      test_ids,
      project_id,
      crusher_token,
      tunnel,
      endpoint,
      port,
    } = flags
    let {base_url} = flags

    if (typeof test_ids === 'undefined' && typeof project_id === 'undefined') {
      console.log(
        'Either test ID or Test Group IDs are needed to run the test.',
      )
      return
    }

    if (tunnel) {
      base_url = await this.createTunnel(port, base_url)
    }

    await cli.action.start('Starting test')
    await Run.makeAPICallToRunTest(project_id, endpoint, crusher_token, base_url, test_ids)

    // @Note
    // If test run locally with tunnelling, do polling and then move to next Statement
    await cli.action.stop()
  }

  private async createTunnel(port: string|undefined, base_url: string|undefined) {
    cli.action.start('Creating tunnel to local service')
    // eslint-disable-next-line radix
    const tunnel = await localTunnel({port: port ? parseInt(port) : 80})
    cli.action.start('Created tunnel')
    base_url = tunnel.url

    tunnel.on('close', () => {
      console.log('Tunnel connection close unexpectedly.')
    })
    return base_url
  }

  private static async makeAPICallToRunTest(project_id: string | undefined, endpoint: string | undefined, crusher_token: string, base_url: string | undefined, test_ids: string | undefined) {
    const gitSha = await getGitLastCommitSHA()
    const gitBranchName = await getGitBranchName()
    const gitRepos: any = await getGitRepos()
    const gitCommitName = await getLastCommitName()
    const isRunningFromGithub = await isFromGithub()
    const firstRepoName = (Object.values(gitRepos)[0] as any).fetch
    const repoName = await extractRepoFullName(firstRepoName)
    const runWholeProject = Boolean(project_id)
    const urlForAPI = runWholeProject ? url.resolve(
      endpoint ? endpoint : getBackendServerUrl(),
      `/projects/runTests/${project_id}`,
    ) : url.resolve(
      endpoint ? endpoint : getBackendServerUrl(),
      '/projects/runTestWithIds',
    )

    const response = await fetch(
      urlForAPI,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliToken: crusher_token,
          projectId: project_id,
          host: base_url,
          branchName: gitBranchName,
          commitId: gitSha,
          commitName: gitCommitName,
          isFromGithub: isRunningFromGithub,
          repoName: repoName,
          test_ids,
        }),
      },
    ).then(async res => {
      return res.json()
    })

    if (response && response.status === 'RUNNING_TESTS') {
      console.log('Test have started running')
    } else {
      console.error('Something went wrong while running tests')
    }
  }
}
