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
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const engine = require('react-engine')

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

// Url de la base de datos en mongo
const { url } = require('./config/database')
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

require('./config/passport')(passport)
// Settings
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Middlewares
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'fadquiereaprender',
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Express error handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)
  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }
  res.status(500).send({ error: err.message })
})

// routes
require('./app/routes')(app, passport)

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

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

server.listen(port, () => {
  console.log(
    `${chalk.green(
      '[fadverse-web]'
    )} server listening on http://localhost:${port}`
  )
  agent.connect()
})
