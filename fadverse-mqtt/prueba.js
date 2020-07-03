var mqtt = require('mqtt')

var options = {
  host: 'localhost',
  port: 1883,
}

const client = mqtt.connect(options)

client.subscribe('presence')
client.publish('presence', 'Hello mqtt')

client.on('message', function (topic, message) {
    console.log(message)    
})

client.end()
