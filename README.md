crusher
=======



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/crusher.svg)](https://npmjs.org/package/crusher)
[![Downloads/week](https://img.shields.io/npm/dw/crusher.svg)](https://npmjs.org/package/crusher)
[![License](https://img.shields.io/npm/l/crusher.svg)](https://github.com/himanshu-dixit/crusher/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g crusher-cli
$ crusher COMMAND
running command...
$ crusher (-v|--version|version)
crusher-cli/1.3.3 darwin-x64 node-v10.20.1
$ crusher --help [COMMAND]
USAGE
  $ crusher COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`crusher help [COMMAND]`](#crusher-help-command)
* [`crusher run`](#crusher-run)
* [`crusher setup`](#crusher-setup)

## `crusher help [COMMAND]`

display help for crusher

```
USAGE
  $ crusher help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `crusher run`

Run visual diff

```
USAGE
  $ crusher run

OPTIONS
  -h, --help                     show CLI help
  -t, --tunnel                   Enable tunneling for remote machine
  --base_url=base_url            base_url, Not required with tunnelling
  --crusher_token=crusher_token  (required) Token from your crusher-cli-macos app
  --project_id=project_id        Project ID
  --test_ids=test_ids            IDs of test you want to run [Optional]

EXAMPLE
  $  crusher run --crusher_token=123 --test_ids=32 -t
  $  crusher run --crusher_token=123 --test_ids=32 --base_url=http://google.com
```

_See code: [src/commands/run.ts](https://github.com/crusherdev/CLI/blob/v1.3.3/src/commands/run.ts)_

## `crusher setup`

Run visual diff

```
USAGE
  $ crusher setup

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  Generate config for running commands
```

_See code: [src/commands/setup.ts](https://github.com/crusherdev/CLI/blob/v1.3.3/src/commands/setup.ts)_
<!-- commandsstop -->
