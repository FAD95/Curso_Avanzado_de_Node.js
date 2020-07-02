' use strict'

const debug = require('debug')('fadverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()
const args = process.argv.slice()

async function setup() {
  if (!args.includes('-y') && !args.includes('--y')) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy all database, are you sure?',
      },
    ])
    if (!answer.setup) {
      return console.log('Nothing happened ;)')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'fadverse',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'arianna',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (s) => debug(s),
    setup: true,
  }
  await db(config).catch(handleFatalError)
  console.log('Success!')
  process.exit(0)
}

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
