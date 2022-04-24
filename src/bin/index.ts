import EntryCommand from "../commands/index";

const nodeVersion = process.version.match(/^v(\d+\.\d+)/)[1];

if (parseFloat(nodeVersion) >= 10.0) {
  const args = process.argv.slice(2);
  const helpArgs = ["-h", "--h", "help", "--help", "-help"];

  if (args.length === 0 || helpArgs.includes(args[0])) {
    console.log("Choose a command to run");
    new EntryCommand().help();
  } else {
    new EntryCommand().run();
  }

} else {
  console.error(
    "Node version must be >= 10.0.0. You are using version: " +
    nodeVersion
  );
}
