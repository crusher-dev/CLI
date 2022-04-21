import EntryCommand from "../commands/index";

const args = process.argv.slice(2);
const helpArgs = ["-h", "--h", "help", "--help", "-help"];

if (args.length === 0 || helpArgs.includes(args[0])) {
  console.log("Choose a command to run");
  new EntryCommand().help();
} else {
  new EntryCommand().run();
}
