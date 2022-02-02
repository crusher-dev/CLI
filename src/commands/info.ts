import Command from "@oclif/command";

export default class Info extends Command {
    static description = 'Shows current project info';

    run(): PromiseLike<any> {
        throw new Error("Method not implemented.");
    }
}