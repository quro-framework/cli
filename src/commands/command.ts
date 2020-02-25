import Base from '../command-base'
import { flags } from '@oclif/command'
import { Options } from 'yeoman-environment'

export default class AppCommand extends Base {
  static description = 'add a command to an existing Bot or Plugin'

  static flags = {
    defaults: flags.boolean({ description: 'use defaults for every setting' }),
    force: flags.boolean({ description: 'overwrite existing files' }),
    pipeable: flags.boolean({ description: 'pipeable command' })
  }

  static args = [
    {
      name: 'name',
      description: 'name of command (namespace sep is ":"; ex "debug:trace")',
      required: true
    }
  ]

  async run() {
    const { flags, args } = this.parse(AppCommand)
    await super.generate('command', {
      name: args.name,
      defaults: flags.defaults,
      force: flags.force,
      pipeable: flags.pipeable
    } as Options)
  }
}
