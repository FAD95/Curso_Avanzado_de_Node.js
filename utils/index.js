'use strict'

const debug = require('debug')('fadverse:db:config')

module.exports = {
  db: {
    database: process.env.DB_NAME || 'fadverse',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'arianna',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (s) => debug(s),
  },
  auth: {
    secret: process.env.SECRET || 'platzi',
    algorithms: ['HS256']
  },
}
