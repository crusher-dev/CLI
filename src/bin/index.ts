import EntryCommand from "../commands/index";

const args = process.argv.slice(2);;

if (args.length === 0) {
  console.log("Choose a command to run")
  new EntryCommand().help()
}
else {
  (new EntryCommand()).run();
}

