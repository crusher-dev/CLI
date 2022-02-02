import { getAppConfig, isCrusherConfigured } from "../common/appConfig";
import { IUserInfo } from "../state/userInfo";
import cli from "cli-ux";

const getLoggedInUser = (): IUserInfo => {
    if(!isCrusherConfigured()) {
        throw cli.error("Crusher not configured yet. Try logging in first.");
    }
    const config = getAppConfig();
    if(!config.userInfo) {
       throw cli.error("No user logged in. Try logging in first.");
    }
    return config.userInfo;
};

const isUserLoggedIn = () => {
    if(!isCrusherConfigured()) {
        return false;
    }
    const config = getAppConfig();
    return !!config.userInfo;
};

export {getLoggedInUser, isUserLoggedIn};