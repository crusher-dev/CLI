import Command from '@oclif/command'
import * as inquirer from 'inquirer'
import cli from 'cli-ux'
import {getProjectConfig} from '../common/projectConfig'
import {getInviteLink, inviteProjectMembers} from '../common'
export default class Invite extends Command {
    static description = 'Invite your team members';

    async run(): Promise<any> {
      const projectConfig = getProjectConfig()

      if (!projectConfig || !projectConfig.project) {
        throw cli.error('Crusher not initialized in this project. Run `crusher init` to fix this.')
      }
      const res = await inquirer.prompt([{
        name: 'method',
        message: 'Choose a method:',
        type: 'list',
          choices: [{ name: 'Invite via email', value: 0 }, { name: 'Invite via link', value: 1 }],
        default: 1
      }])
      this.log('\n')
      await cli.action.start('Preparing a cryptic invite code.')
      await new Promise(resolve => setTimeout(resolve, 1000))
      await cli.action.stop()

      if (res.method === 0) {
          const emailsRes = await inquirer.prompt([{
            name: "emails",
            message: 'Who should we invite (comma separated)?',
          type: 'input',
        }])
          console.log("Email res is", emailsRes.emails);
        await cli.action.start('Sending invites')
        const inviteRes = await inviteProjectMembers(projectConfig.project, emailsRes.emails.split(','))
          await cli.action.stop()
          this.log("\nInvited your folks to use crusher!. Ask them to check there mail.");
      } else {
        this.log('Your Invite link:', await getInviteLink(projectConfig.project))
      }
    }
}
