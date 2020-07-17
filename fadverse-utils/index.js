'use strict'

const debug = require('debug')('fadverse:db:config')

const requestOpts = require('./src/request')

const { database, username, password, host } = require('./src/commons')

module.exports = {
  db: {
    database: database,
    username: username,
    password: password,
    host: host,
    dialect: 'postgres',
    logging: (s) => debug(s),
  },
  auth: {
    secret: process.env.SECRET || 'platzi',
    algorithms: ['HS256'],
  },
  requestOpts
}
