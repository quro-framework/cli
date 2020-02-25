import Generator = require('yeoman-generator')
import { Options } from 'yeoman-environment'
import * as path from 'path'
import * as changeCase from 'change-case'

class CommandGenerator extends Generator {
  projectJson!: any

  get ts() {
    return this.projectJson?.devDependencies?.typescript ?? false
  }

  get scriptExtension() {
    return this.ts ? 'ts' : 'js'
  }

  get directoryPath() {
    return this.options.name
      .split(':')
      .slice(0, -1)
      .join('/')
  }

  get path() {
    return this.options.name.split(':').join('/')
  }

  get pipeable() {
    return !!this.options.pipeable
  }

  constructor(args: any, public options: Options) {
    super(args, options)
  }

  async prompting() {
    this.projectJson = this.fs.readJSON('package.json')
    if (!this.projectJson) {
      throw new Error('not in a project directory')
    }
    this.log(`Adding a command to ${this.projectJson.name}`)
  }

  writing() {
    this.sourceRoot(path.join(__dirname, '../../templates'))
    const commandName = this.options.name
    const fileName = changeCase.pascalCase(path.parse(this.path).name)
    const className = changeCase.pascalCase(this.options.name) + 'Command'
    const commandExportName = changeCase.camelCase(this.options.name)
    const commandPath = this.destinationPath(
      `src/commands/${this.directoryPath}/${fileName}.${this.scriptExtension}`
    )
    const opts = {
      ...this.options,
      type: 'command',
      path: commandPath,
      name: commandName,
      className,
      commandName,
      commandExportName,
      pipeable: this.pipeable
    }
    this.fs.copyTpl(
      this.templatePath(`src/command.${this.scriptExtension}.ejs`),
      commandPath,
      opts
    )
  }
}

export = CommandGenerator
