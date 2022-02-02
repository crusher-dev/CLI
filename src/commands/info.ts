import Command from "@oclif/command";
import { getProjectInfo, getTotalTestsInProject } from "../common";
import { getProjectConfig } from "../common/projectConfig";
import { initHook } from "../hooks/init";
import { getLoggedInUser } from "../utils/index";

export default class Info extends Command {
    static description = 'Shows current project info';

    
    async run(): Promise<any> {
        const { args, flags } = await this.parse(Info)
        const projectConfig = getProjectConfig();
        const userAccount = getLoggedInUser();
        const projectInfo = await getProjectInfo(projectConfig.project);
        const testsCountInProject = await getTotalTestsInProject(projectConfig.project);

        this.log("-----------");
        console.log("Team:", userAccount.teamName);
        console.log("Name:", userAccount.name);
        console.log("Login:", userAccount.email);
        console.log("Project name: ", projectInfo.name);
        console.log("Tests tests in this project:", testsCountInProject);
    }
}