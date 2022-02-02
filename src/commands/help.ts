import Command from "@oclif/command";

export default class Help extends Command {
    static description = 'Help content comes here';

    run(): PromiseLike<any> {
        throw new Error("Method not implemented.");
    }
}