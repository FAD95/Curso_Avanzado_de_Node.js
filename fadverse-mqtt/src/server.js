'use strict'

const net = require('net')
const debug = require('debug')('fadverse:mqtt')
const chalk = require('chalk')
const db = require('fadverse-db')
const redisPersistence = require('aedes-persistence-redis')
const { parsePayload } = require('./utils')
const config = {
  database: process.env.DB_NAME || 'fadverse',
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASS || 'arianna',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: (s) => debug(s),
}
// const {
//   utils: { parsePayload, handleFatalError, handleError },
//   config,
// } = require('ionode-tools')

// Aedes is a barebone MQTT server that can run on any stream servers
// See https://github.com/moscajs/aedes
// redisPersistence to make aedes backend with redis
// https://www.npmjs.com/package/aedes-persistence-redis

const aedes = require('aedes')()
//   ({
//   persistence: redisPersistence({
//     port: 6379,
//     host: '127.0.0.1',
//     family: 4,
//     maxSessionDelivery: 100,
//   }),
// })

// This is the database setup
// const databaseConfig = {
//   ...config.db,
//   logging: (msg) => debug(msg),
// }

// The server is implemented with core module `net` that expose a createServer method
// The net module provides an asynchronous network API for creating stream-based
// TCP or IPC servers (net.createServer()) and clients (net.createConnection()).
// See https://nodejs.org/api/net.html#net_event_connection
const server = net.createServer(aedes.handle)

// to store the clients connected
const clients = new Map()
let Agent
let Metric

server.listen(1883, (error) => {
  if (!error) {
    console.log(`${chalk.cyan('[fadverse-mqtt]:')} server is running`)
  } else {
    handleFatalError(error)
  }
})

server.on('listening', async () => {
  try {
    // Initializes Agent and Metric services
    const services = await db(config).catch(handleFatalError)
    Agent = services.Agent
    Metric = services.Metric
  } catch (error) {
    handleError(error)
  }
})

aedes.on('client', (client) => {
  debug(`[Client-Connected]: ${client.id}`)

  clients.set(client.id, null)
})

aedes.on('publish', async (packet, client) => {
  debug(`[Recived]: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected': {
      debug(`[Payload]: ${packet.payload}`)
      break
    }
    case 'agent/message': {
      debug(`[Payload]: ${packet.payload}`)

      // Store Agent in DB
      const payload = await parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (err) {
          return handleError(err)
        }
        debug(`Agent ${agent.uuid} saved`)

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          aedes.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected,
              },
            }),
          })
        }

        // Store Metrics

        const allMetrics = payload.metrics.map((metric) => {
          return Metric.create(agent.uuid, metric)
        })
        try {
          await Promise.all(allMetrics)
            .then((values) => {
              debug(`[Metrics saved] on agent: ${agent.uuid}`)
            })
            .catch((err) => handleError(err))
        } catch (err) {
          handleError(err)
        }
      }
      break
    }
  }
})

aedes.on('clientDisconnect', async (client) => {
  debug(`[Client-Disconnected]: ${client.id}`)
  // // Try to find the client in the clients connected list
  const agent = clients.get(client.id)

  if (agent) {
    // if client exists update its connected state to false in database
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (error) {
      handleError(error)
    }

    // Delete agent from clients connected list
    clients.delete(client.id)

    aedes.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid,
        },
      }),
    })

    debug(
      `[report]: Client ${client.id} associated to Agent ${agent.uuid} marked as disconnected`
    )
  }
})

aedes.on('error', handleFatalError)

function handleError(err) {
  console.error(`${chalk.red('[Error]')} ${err.message}`)
  console.error(err.stack)
}

function handleFatalError(err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

// Para manejar procesos que no han sido capturados
process.on('uncaughtExeption', handleFatalError)
process.on('unhandledRejection', handleFatalError)
