'use strict'

const debug = require('debug')('fadverse:web')
const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')
const chalk = require('chalk')
const path = require('path')
const FadverseAgent = require('fadverse-agent')
const { pipe } = require('./utils')
const proxy = require('./proxy')

const port = process.env.PORT || 8080
const app = asyncify(express())
const server = http.createServer(app)
const io = require('socket.io')(server)
const agent = new FadverseAgent({
  name: 'myapp',
  username: 'admin',
  interval: 2000,
  mqtt: {
    host: 'mqtt://localhost:1883',
  },
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', proxy)

// Express error handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)
  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }
  res.status(500).send({ error: err.message })
})

// Socket.io / WebSockets
io.on('connect', (socket) => {
  debug(`Connected ${socket.id}`)
  pipe(agent, socket)
})




function handleFatalError(err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(
    `${chalk.green(
      '[fadverse-web]'
    )} server listening on http://localhost:${port}`
  )
  agent.connect()
})
