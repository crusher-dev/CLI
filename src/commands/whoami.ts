/* tslint:disable */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Command from '@oclif/command'
import { getLoggedInUser, getProjectNameFromGitInfo } from '../utils/index';

export default class WhoAmI extends Command {
    static description = 'Your account information';

    async run() {
      const userAccount = getLoggedInUser()
      console.log('Suggested project name:', getProjectNameFromGitInfo());
      this.log('-----------')
      console.log('Team:', userAccount.teamName)
      console.log('Name:', userAccount.name)
      console.log('Login:', userAccount.email)
    }
}
