'use strict'

const { buildFederatedService } = require('./lib/federate')
const { forward } = require('./lib/network')

module.exports = {
  buildFederatedService,
  forward
}
