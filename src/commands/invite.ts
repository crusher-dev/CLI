import Command from "@oclif/command";

export default class Invite extends Command {
    static description = 'Invite your team members';

    run(): PromiseLike<any> {
        throw new Error("Method not implemented.");
    }
}