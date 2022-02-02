import Command from "@oclif/command";

export default class Logout extends Command {
    static description = 'Logout from your account';

    run(): PromiseLike<any> {
        throw new Error("Method not implemented.");
    }
}