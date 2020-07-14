'use strict'

const debug = require('debug')('fadverse-web')
const http = require('http')
const express = require('express')
const chalk = require('chalk')
const path = require('path')
const FadverseAgent = require('fadverse-agent')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
const agent = new FadverseAgent()

app.use(express.static(path.join(__dirname, 'public')))

// Socket.io / WebSockets
io.on('connect', (socket) => {
    debug(`Connected ${socket.id}`)
  console.log(`Connected ${socket.id}`)    
    agent.on('agent/connected', (payload) => {
      socket.emit('agent/connected', payload)
    })
    agent.on('agent/message', (payload) => {
      socket.emit('agent/message', payload)
    })
    agent.on('agent/disconnected', (payload) => {
      socket.emit('agent/disconnected', payload)
    })
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
