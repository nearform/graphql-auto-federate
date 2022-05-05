'use strict'

const t = require('tap')
const dedent = require('dedent')
const helper = require('./helper')

const { buildFederatedInfo } = require('../lib/federate')

const db = {
  users: {
    1: { id: '1', name: 'Jimmy', fullName: 'James Morgan McGill' },
    2: { id: '2', name: 'Kim', fullName: 'Kimberly Wexler' },
    3: { id: '3', name: 'Amigo del cartel' }
  }
}

const cases = [
  {
    name: 'should federate an "hello world" service',
    schema: dedent`
    type Query {
      hello (greeting: String!): String
    }`,
    resolvers: {
      Query: { hello: (parent, args) => args.greeting }
    },
    options: {
      type: { Query: { '@extend': true } }
    },
    queries: [
      {
        query: '{ hello (greeting: "ciao") }',
        expected: { hello: 'ciao' }
      },
      {
        query: 'query Hello($message: String!) { hello (greeting: $message) }',
        variables: { message: 'ciao' },
        expected: { hello: 'ciao' }
      }
    ]
  },

  {
    name: 'should federate an basic service with a custom type and @key directives',
    schema: dedent`
    type Query {
      me: User
      you: User
    }      
    type User {
      id: ID!
      name: String!
      fullName: String
      friends: [User]
    }
    `,
    resolvers: {
      Query: {
        me: () => {
          return db.users[1]
        },
        you: () => db.users[2]
      },
      User: {
        friends: user => {
          return user.id == 1 ? [db.users[3]] : []
        },
        fullName: user => {
          return user.fullName || user.name
        }
      }
    },
    options: {
      type: {
        Query: { '@extend': true },
        User: { '@directives': '@key(fields: "id")' }
      },
      resolvers: {
        User: {
          __resolveReference: user => {
            return db.users[user.id]
          }
        }
      }
    },
    queries: [
      {
        query: '{ me { id, name, fullName, friends { fullName } } }',
        expected: {
          me: {
            id: '1',
            name: 'Jimmy',
            fullName: 'James Morgan McGill',
            friends: [{ fullName: 'Amigo del cartel' }]
          }
        }
      }
    ]
  }
]

for (const { name, schema, resolvers, queries, options } of cases) {
  t.test(name, async t => {
    let federated, gateway
    t.teardown(async () => {
      await helper.stopServices([federated?.service, gateway?.service])
    })

    federated = await helper.createFederatedService({
      ...buildFederatedInfo({ schema, resolvers, options })
    })
    gateway = await helper.createGatewayService({
      services: [{ url: `http://localhost:${federated.port}/graphql` }]
    })

    const gatewayUrl = `http://localhost:${gateway.port}/graphql`
    for (const { query, variables, expected } of queries) {
      const result = await helper.query({ query, variables, url: gatewayUrl })
      t.same(result.data, expected)
    }
  })
}
