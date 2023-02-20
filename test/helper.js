'use strict'

const fastify = require('fastify')
const mercurius = require('mercurius')
const undici = require('undici')
const { mercuriusFederationPlugin } = require('@mercuriusjs/federation')
const mercuriusGateway = require('@mercuriusjs/gateway')

const helper = {
  async createService({ port, schema, resolvers, loaders }) {
    if (!port) {
      port = await (await import('get-port')).default()
    }
    const service = fastify()

    service.register(mercurius, {
      schema,
      resolvers: resolvers ?? {},
      loaders,
      jit: 1
    })
    await service.listen({ port })
    return { service, port }
  },
  async createFederatedService({ port, schema, resolvers, loaders }) {
    if (!port) {
      port = await (await import('get-port')).default()
    }
    const service = fastify()

    service.register(mercuriusFederationPlugin, {
      schema,
      resolvers: resolvers ?? {},
      loaders,
      jit: 1
    })
    await service.listen({ port })
    return { service, port }
  },
  async createGatewayService({ port, services }) {
    if (!port) {
      port = await (await import('get-port')).default()
    }
    const service = fastify()

    service.register(mercuriusGateway, {
      gateway: { services },
      jit: 1
    })
    await service.listen({ port })
    return { service, port }
  },
  async stopServices(services) {
    await Promise.all(services.map(service => service?.close()))
  },

  async query({ query, variables, url }) {
    const { body } = await undici.request(url, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
      headers: { 'content-type': 'application/json' }
    })
    return await body.json()
  },

  async assertService(t, service) {
    const f = fastify()

    f.register(mercuriusFederationPlugin, {
      ...service
    })
    await f.listen()
    await f.close()

    t.pass()
  }
}

module.exports = helper
