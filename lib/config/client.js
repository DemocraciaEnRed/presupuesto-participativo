var config = require('lib/config')
var client = {}

config.client.forEach(function (key) {
  if (!config.hasOwnProperty(key)) {
    throw new Error('Config key "' + key + '" non existent.')
  }

  client[key] = config[key]
})

client.store = config.store

if (client.hasOwnProperty('jwtSecret')) {
  throw new Error('"jwtSecret" config key should never be sended to the client.')
}

module.exports = client
