import Command from "@oclif/command";

export default class WhoAmI extends Command {
    static description = 'Your account information';

    run(): PromiseLike<any> {
        throw new Error("Method not implemented.");
    }
}