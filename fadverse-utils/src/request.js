'use strict'

const { endpoint, apiToken } = require('./commons')

const request = {
  get: (apiUrl) => {
    const url = endpoint.concat(apiUrl)
    const options = {
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      json: true,
    }
    return options
  },
}

module.exports = request
