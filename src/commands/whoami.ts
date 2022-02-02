import Command from "@oclif/command";
import { getUserInfo } from "../state/userInfo";
import { getLoggedInUser } from "../utils/index";

export default class WhoAmI extends Command {
    static description = 'Your account information';

    async run() {
        const userAccount = getLoggedInUser();
        this.log("-----------");
        console.log("Team:", userAccount.teamName);
        console.log("Name:", userAccount.name);
        console.log("Login:", userAccount.email);
    }
}