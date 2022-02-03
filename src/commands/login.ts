/* tslint:disable */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Command, { flags } from "@oclif/command";
import { initHook } from "../hooks/init";
import { getLoggedInUser } from "../utils/index";
import { isUserLoggedIn } from "../utils/index";
import cli from "cli-ux";

export default class Login extends Command {
    static description = 'Login to Crusher';

    static flags = {
        token: flags.string({ char: 't', description: 'Crusher user token' }),
    };

    async run(): Promise<any> {
        const { args, flags } = await this.parse(Login)
        const loggedIn = isUserLoggedIn();
        if(!loggedIn) {
            await initHook({token: flags.token})
        } else {
            const loggedInUser = getLoggedInUser();
            cli.log(`You're already logged in from ${loggedInUser.email}.\nTo login from different account, run crusher-cli logout and then crusher-cli login.`)
        }
    }
}