import Command from "@oclif/command";

export default class Login extends Command {
    static description = 'Login to Crusher';

    run(): PromiseLike<any> {
        throw new Error("Method not implemented.");
    }
}