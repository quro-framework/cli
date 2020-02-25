@quro/cli
=========

quro cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@quro/cli.svg)](https://npmjs.org/package/@quro/cli)
[![CircleCI](https://circleci.com/gh/hota1024/quro-cli/tree/master.svg?style=shield)](https://circleci.com/gh/hota1024/quro-cli/tree/master)
[![Codecov](https://codecov.io/gh/hota1024/quro-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/hota1024/quro-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@quro/cli.svg)](https://npmjs.org/package/@quro/cli)
[![License](https://img.shields.io/npm/l/@quro/cli.svg)](https://github.com/hota1024/quro-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @quro/cli
$ quro COMMAND
running command...
$ quro (-v|--version|version)
@quro/cli/0.0.11 darwin-x64 node-v12.14.1
$ quro --help [COMMAND]
USAGE
  $ quro COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`quro bot [PATH]`](#quro-bot-path)
* [`quro command NAME`](#quro-command-name)
* [`quro help [COMMAND]`](#quro-help-command)

## `quro bot [PATH]`

generate a new bot

```
USAGE
  $ quro bot [PATH]

ARGUMENTS
  PATH  path to project, defaults to current directory

OPTIONS
  --defaults         use defaults for every setting
  --force            overwrite existing files
  --options=options  (yarn|typescript|eslint|prettier)
```

_See code: [src/commands/bot.ts](https://github.com/hota1024/quro-cli/blob/v0.0.11/src/commands/bot.ts)_

## `quro command NAME`

add a command to an existing Bot or Plugin

```
USAGE
  $ quro command NAME

ARGUMENTS
  NAME  name of command (namespace sep is ":"; ex "debug:trace")

OPTIONS
  --defaults  use defaults for every setting
  --force     overwrite existing files
  --pipeable  pipeable command
```

_See code: [src/commands/command.ts](https://github.com/hota1024/quro-cli/blob/v0.0.11/src/commands/command.ts)_

## `quro help [COMMAND]`

display help for quro

```
USAGE
  $ quro help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
