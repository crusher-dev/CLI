import Command from '@oclif/command'
import {getUserInfo} from '../state/userInfo'
import { findGitRoot, getLoggedInUser, getProjectNameFromGitInfo } from '../utils/index';
import * as ini from 'ini'
import * as fs from 'fs'

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
