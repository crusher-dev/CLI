import Command from "@oclif/command";
import { getAppConfig, setAppConfig } from "../common/appConfig";

export default class Logout extends Command {
    static description = 'Logout from your account';

    async run(): Promise<any> {
        const appConfig = getAppConfig();
        if(appConfig["userInfo"]) delete appConfig["userInfo"];
        setAppConfig(appConfig);
        this.log("Logged out from this machine");
    }
}