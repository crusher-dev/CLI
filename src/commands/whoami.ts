import Command from "@oclif/command";
import { getUserInfo } from "../state/userInfo";
import { findGitRoot, getLoggedInUser } from "../utils/index";
import * as ini from "ini";
import * as fs from "fs";

export default class WhoAmI extends Command {
    static description = 'Your account information';

    async run() {
        const userAccount = getLoggedInUser();
        const config = fs.readFileSync(findGitRoot() + "/config", "utf-8");
        const configFile = ini.parse(config);
        const remotes = Object.keys(configFile).filter(key => key.startsWith("remote")).map(key => configFile[key]);
        console.log("Suggested project name:", remotes.map(remote => remote.url.split("/").pop().replace(".git", "")).join("\n"));
        this.log("-----------");
        console.log("Team:", userAccount.teamName);
        console.log("Name:", userAccount.name);
        console.log("Login:", userAccount.email);
    }
}