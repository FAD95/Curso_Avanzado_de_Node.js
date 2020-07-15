const FadverseAgent = require('../')

const agent = new FadverseAgent({
  name: 'myapp',
  username: 'admin',
  interval: 2000,
  mqtt: {
    host: 'mqtt://localhost:1883',
  },
})

agent.connect()

agent.addMetric('rss', function getRss() {
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise() {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback(callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})


// This agent only
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// Agents from mqtt server
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', handler)

function handler(payload) {
  console.log(payload)
}

setTimeout(() => agent.disconnect(), 10000)
