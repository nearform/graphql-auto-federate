'use strict'

const fastify = require('fastify')
const mercurius = require('mercurius')
const { mercuriusFederationPlugin } = require('@mercuriusjs/federation')

// const { buildFederatedService } = require('graphql-auto-federate')
const { buildFederatedService } = require('../')

async function main() {
  const originalService = fastify()
  originalService.register(mercurius, {
    schema: `
    type Query {
      hello (greeting: String!): String
    }`,
    resolvers: {
      Query: { hello: (_, args) => args.greeting }
    },
    graphiql: true,
    jit: 1
  })
  await originalService.listen({ port: 2999 })

  const federated = await buildFederatedService({
    url: `http://localhost:2999/graphql`
  })

  const federatedService = fastify()
  federatedService.register(mercuriusFederationPlugin, {
    schema: federated.schema,
    resolvers: federated.resolvers,
    jit: 1
  })
  await federatedService.listen({ port: 3001 })

  const gateway = fastify()
  gateway.register(mercurius, {
    gateway: {
      services: [{ name: 'auto', url: `http://localhost:3001/graphql` }]
    },
    graphiql: true,
    jit: 1
  })
  await gateway.listen({ port: 3000 })

  // query the gateway @ port 3000
  // curl -X POST -H 'content-type: application/json' -d '{ "query": "{ hello(greeting: \"ciao\") }" }' localhost:3000/graphql
}

main()
