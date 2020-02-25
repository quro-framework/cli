import Generator = require('yeoman-generator')
import * as path from 'path'
import * as _ from 'lodash'
import { execSync } from 'child_process'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const debug = require('debug')('quro-generator')
import fixpack = require('@oclif/fixpack')
import * as sortPjson from 'sort-pjson'

let hasYarn = false
try {
  execSync('yarn -v', { stdio: 'ignore' })
  hasYarn = true
  // eslint-disable-next-line no-empty
} catch {}

class AppGenerator extends Generator {
  options: {
    defaults?: boolean
    typescript: boolean
    eslint: boolean
    prettier: boolean
    yarn: boolean
    dotenv: boolean
    botToken: boolean
    nodemon: boolean
  }

  args!: {
    [k: string]: string
  }

  type: 'bot' | 'plugin'

  path: string

  prefix = '$'

  projectJson: any

  githubUser: string | undefined

  answers!: {
    name: string
    description: string
    version: string
    github: {
      repo: string
      user: string
    }
    author: string
    prefix: string
    license: string
    pkg: string
    typescript: boolean
    dotenv: boolean
    eslint: boolean
    prettier: boolean
    botToken: boolean
    nodemon: boolean
  }

  botToken!: boolean
  nodemon!: boolean
  ts!: boolean
  dotenv!: boolean
  eslint!: boolean
  prettier!: boolean
  yarn!: boolean

  get scriptExtension() {
    return this.ts ? 'ts' : 'js'
  }

  repository!: string

  constructor(args: any, opts: any) {
    super(args, opts)

    this.type = opts.type
    this.path = opts.path
    this.options = {
      defaults: opts.defaults,
      typescript: opts.options.includes('typescript'),
      eslint: opts.options.includes('eslint'),
      prettier: opts.options.includes('prettier'),
      yarn: opts.options.includes('yarn')
    } as any
  }

  async prompting() {
    if (this.path) {
      this.destinationRoot(path.resolve(this.path))
      process.chdir(this.destinationRoot())
    }
    this.githubUser = await this.user.github.username().catch(debug)
    this.projectJson = {
      scripts: {},
      dependencies: {},
      devDependencies: {},
      ...this.fs.readJSON('package.json', {}) // Overwrite by existing package.json
    }
    let repository = this.destinationRoot()
      .split(path.sep)
      .slice(-2)
      .join('/')
    if (this.githubUser) {
      repository = `${this.githubUser}/${repository.split('/')[1]}`
    }

    const defaults = {
      name: this.determineAppname().replace(/ /g, '-'),
      version: '0.0.0',
      license: 'MIT',
      author: this.githubUser
        ? `${this.user.git.name()} @${this.githubUser}`
        : this.user.git.name(),
      prefix: '$',
      dependencies: {},
      repository,
      ...this.projectJson,
      options: this.options
    }
    this.repository = defaults.repository

    if (this.repository && (this.repository as any).url) {
      this.repository = (this.repository as any).url
    }

    if (this.options.defaults) {
      this.answers = defaults
    } else {
      this.answers = (await this.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'npm package name',
          default: defaults.name,
          when: !this.projectJson.name
        },
        {
          type: 'input',
          name: 'description',
          message: 'description',
          default: defaults.description,
          when: !this.projectJson.description
        },
        {
          type: 'input',
          name: 'author',
          message: 'author',
          default: defaults.author,
          when: !this.projectJson.author
        },
        {
          type: 'input',
          name: 'version',
          message: 'version',
          default: defaults.version,
          when: !this.projectJson.version
        },
        {
          type: 'input',
          name: 'prefix',
          default: defaults.prefix
        },
        {
          type: 'input',
          name: 'license',
          message: 'license',
          default: defaults.license,
          when: !this.projectJson.license
        },
        {
          type: 'input',
          name: 'github.user',
          message:
            'Who is the GitHub owner of repository (https://github.com/OWNER/repo)',
          default: repository
            .split('/')
            .slice(0, -1)
            .pop(),
          when: !this.projectJson.repository
        },
        {
          type: 'input',
          name: 'github.repo',
          message:
            'What is the GitHub name of repository (https://github.com/owner/REPO)',
          default: (answers: any) =>
            (
              this.projectJson.repository ||
              answers.name ||
              this.projectJson.name
            )
              .split('/')
              .pop(),
          when: !this.projectJson.repository
        },
        {
          type: 'list',
          name: 'pkg',
          message: 'Select a package manager',
          choices: [
            { name: 'npm', value: 'npm' },
            { name: 'yarn', value: 'yarn' }
          ],
          default: () => (this.options.yarn || hasYarn ? 1 : 0)
        },
        {
          type: 'confirm',
          name: 'dotenv',
          message: 'Use dotenv (load env variable from .env file)',
          default: () => true
        },
        {
          type: 'confirm',
          name: 'typescript',
          message: 'TypeScript',
          default: () => true
        },
        {
          type: 'confirm',
          name: 'eslint',
          message: 'Use eslint (linter for JavaScript and TypeScript)',
          default: () => true
        },
        {
          type: 'confirm',
          name: 'prettier',
          message:
            'Use prettier (code formatter for JavaScript and TypeScript)',
          default: () => true
        },
        {
          type: 'confirm',
          name: 'nodemon',
          message: 'Use nodemon (Restart bot on file changed)',
          default: () => true
        },
        {
          type: 'password',
          name: 'botToken',
          message: 'Your Discord bot token (Optional)',
          default: () => 'NO_TOKEN'
        }
      ])) as any

      debug(this.answers)
      if (!this.options.defaults) {
        this.options = {
          typescript: this.answers.typescript,
          eslint: this.answers.eslint,
          prettier: this.answers.prettier,
          yarn: this.answers.pkg === 'yarn',
          dotenv: this.answers.dotenv,
          botToken: this.answers.botToken,
          nodemon: this.answers.nodemon
        }
      }
      this.ts = this.options.typescript
      this.yarn = this.options.yarn
      this.eslint = this.options.eslint
      this.prettier = this.options.prettier
      this.dotenv = this.options.dotenv
      this.botToken = this.options.botToken
      this.nodemon = this.options.nodemon

      this.projectJson.name = this.answers.name || defaults.name
      this.projectJson.description =
        this.answers.description || defaults.description
      this.projectJson.version = this.answers.version || defaults.version
      this.projectJson.license = this.answers.license || defaults.license
      this.prefix = this.answers.prefix

      this.projectJson.scripts['start'] = this.ts
        ? 'ts-node src/index.ts'
        : 'node src/index.ts'
      if (this.nodemon) {
        this.projectJson.scripts['watch'] = 'nodemon'
      }

      this.repository = this.projectJson.repository = this.answers.github
        ? `${this.answers.github.user}/${this.answers.github.repo}`
        : defaults.repository
    }
  }

  writing() {
    this.sourceRoot(path.join(__dirname, '../../templates'))

    if (this.ts) {
      this.fs.copyTpl(
        this.templatePath('tsconfig.json'),
        this.destinationPath('tsconfig.json'),
        this
      )
    }
    if (this.eslint) {
      if (this.ts) {
        if (this.prettier) {
          this.fs.copyTpl(
            this.templatePath('eslintrc.prettier.typescript'),
            this.destinationPath('.eslintrc'),
            this
          )
        } else {
          this.fs.copyTpl(
            this.templatePath('eslintrc.typescript'),
            this.destinationPath('.eslintrc'),
            this
          )
        }
      } else {
        if (this.prettier) {
          this.fs.copyTpl(
            this.templatePath('eslintrc.prettier'),
            this.destinationPath('.eslintrc'),
            this
          )
        } else {
          this.fs.copyTpl(
            this.templatePath('eslintrc'),
            this.destinationPath('.eslintrc'),
            this
          )
        }
      }
      if (this.prettier) {
        this.fs.copyTpl(
          this.templatePath('prettierrc'),
          this.destinationPath('.prettierrc'),
          this
        )
      }

      this.fs.copyTpl(
        this.templatePath('README.md.ejs'),
        this.destinationPath('README.md'),
        this
      )
      if (this.projectJson.license === 'MIT') {
        this.fs.copyTpl(
          this.templatePath('LICENSE.mit'),
          this.destinationPath('LICENSE'),
          this
        )
      }
      if (this.dotenv) {
        this.fs.copyTpl(
          this.templatePath('dotenv'),
          this.destinationPath('.env'),
          this
        )
      }
      if (this.nodemon) {
        if (this.ts) {
          this.fs.copyTpl(
            this.templatePath('nodemon.typescript'),
            this.destinationPath('nodemon.json'),
            this
          )
        } else {
          this.fs.copyTpl(
            this.templatePath('nodemon'),
            this.destinationPath('nodemon.json'),
            this
          )
        }
      }

      if (this.fs.exists(this.destinationPath('package.json'))) {
        fixpack(
          this.destinationPath('./package.json'),
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('@oclif/fixpack/config.json')
        )
      }
      this.fs.writeJSON(
        this.destinationPath('./package.json'),
        sortPjson(this.projectJson)
      )

      this.fs.write('.gitignore', this.getGitignoreContent())

      if (this.type === 'bot') {
        this.log(this.templatePath(`bot/src/index.${this.scriptExtension}`))
        this.fs.copyTpl(
          this.templatePath(`bot/src/index.${this.scriptExtension}`),
          this.destinationPath(`src/index.${this.scriptExtension}`),
          this
        )
        this.fs.copyTpl(
          this.templatePath(`bot/src/commands/Ping.${this.scriptExtension}`),
          this.destinationPath(`src/commands/Ping.${this.scriptExtension}`),
          this
        )
      }
    }
  }

  install() {
    const dependencies: string[] = []
    const devDependencies: string[] = []

    dependencies.push('quro')

    if (this.dotenv) {
      dependencies.push('dotenv')
    }

    if (this.ts) {
      devDependencies.push('typescript', 'ts-node', '@types/node')
    }

    if (this.eslint) {
      devDependencies.push('eslint')

      if (this.ts) {
        devDependencies.push(
          '@typescript-eslint/eslint-plugin',
          '@typescript-eslint/parser'
        )
      }
    }

    if (this.prettier) {
      devDependencies.push(
        'prettier',
        'eslint-config-prettier',
        'eslint-plugin-prettier'
      )
    }

    if (this.nodemon) {
      devDependencies.push('nodemon')
    }

    const yarnOpts = {} as any
    if (process.env.YARN_MUTEX) {
      yarnOpts.mutext = process.env.YARN_MUTEX
    }
    const install = (deps: string[], opts: object) =>
      this.yarn ? this.yarnInstall(deps, opts) : this.npmInstall(deps, opts)
    const dev = this.yarn ? { dev: true } : { 'save-dev': true }
    const save = this.yarn ? {} : { save: true }
    return Promise.all([
      install(devDependencies, { ...yarnOpts, ...dev, ignoreScripts: true }),
      install(dependencies, { ...yarnOpts, ...save })
    ])
  }

  getGitignoreContent() {
    const existing = this.fs.exists(this.destinationPath('.gitignore'))
      ? this.fs.read(this.destinationPath('.gitignore')).split('\n')
      : []
    return (
      _([
        '*-debug.log',
        '*-error.log',
        'node_modules',
        this.yarn ? '/package-lock.json' : '/yarn.lock',
        this.dotenv ? '/.env' : ''
      ])
        .concat(existing)
        .compact()
        .uniq()
        .sort()
        .join('\n') + '\n'
    )
  }
}

export = AppGenerator
