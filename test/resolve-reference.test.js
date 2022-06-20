'use strict'

require('./setup')
const t = require('tap')
const dedent = require('dedent')
const clone = require('rfdc')()
const helper = require('./helper')

const { buildFederatedService } = require('../')

const db = {
  _users: {
    1: { id: '1', name: 'Jimmy', fullName: 'James Morgan McGill' },
    2: { id: '2', name: 'Kim', fullName: 'Kimberly Wexler' },
    3: { id: '3', name: 'Mike', fullName: 'Michael Ehrmantraut' },
    4: { id: '4', name: 'Nacho', fullName: 'Ignacio Varga' }
  },
  _posts: {
    1: { id: '1', title: 'Hello', authorId: 1 }
  }
}

const cases = [
  {
    name: 'should use proxy client in __resolveReference',
    services: [
      {
        options: {
          auto: true,
          resolvers: {
            User: {
              __resolveReference: async (
                self,
                args,
                context,
                info,
                forward
              ) => {
                const response = await forward({
                  query: `{ getUser (id: ${self.id}) { name, fullName, friends { id, name } } }`
                })

                return {
                  ...response.getUser,
                  ...self
                }
              }
            }
          }
        },

        schema: dedent`    
        type Query {
          getPosts: [Post!]!
          
          getUser (id: ID!): User
          getUsers (ids: [ID!]!): [User]!
        }

        type Mutation {
          createUser (user: InputUser): User
        }
        
        input InputUser {
          name: String!
        }

        type Post {
          id: ID!
          title: String!
          author: User
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
            getUser: (_, args) => {
              return db.users[args.id]
            },
            getUsers: () => {
              return Object.values(db.users)
            },
            getPosts: () => {
              return Object.values(db.posts)
            }
          },
          Mutation: {
            createUser: (_, { user: inputUser }) => {
              const id = Object.keys(db.users).length + 1
              const user = { id, ...inputUser }
              db.users[id] = user
              return user
            }
          },
          User: {
            friends: user => {
              return Object.values(db.users).filter(u => u.id !== user.id)
            },
            fullName: user => {
              return user.fullName || user.name
            }
          },
          Post: {
            author: self => {
              return db.users[self.authorId]
            }
          }
        }
      }
    ],
    queries: [
      {
        query: '{ getUser (id: "1") { id, name, friends { id, name } } }',
        expected: {
          getUser: {
            id: '1',
            name: 'Jimmy',
            friends: [
              {
                id: '2',
                name: 'Kim'
              },
              {
                id: '3',
                name: 'Mike'
              },
              {
                id: '4',
                name: 'Nacho'
              }
            ]
          }
        }
      },

      {
        query: '{ getPosts { id, title, author { id, name, fullName } } }',
        expected: {
          getPosts: [
            {
              id: '1',
              title: 'Hello',
              author: {
                id: '1',
                name: 'Jimmy',
                fullName: 'James Morgan McGill'
              }
            }
          ]
        }
      },

      {
        query:
          'mutation { createUser (user: {name: "Gus"}) { id, name, fullName } }',
        expected: {
          createUser: {
            id: '5',
            name: 'Gus',
            fullName: 'Gus'
          }
        }
      }
    ]
  }
]

for (const { name, services, queries } of cases) {
  t.beforeEach(() => {
    db.users = clone(db._users)
    db.posts = clone(db._posts)
  })
  t.test(name, async t => {
    const targets = [],
      federateds = []
    let gateway
    t.teardown(async () => {
      await helper.stopServices([
        gateway?.service,
        ...targets.map(s => s.service),
        ...federateds.map(s => s.service)
      ])
    })

    for (const { schema, resolvers, options } of services) {
      const target = await helper.createService({ schema, resolvers })
      const federated = await helper.createFederatedService(
        await buildFederatedService({
          url: `http://localhost:${target.port}/graphql`,
          options
        })
      )
      targets.push(target)
      federateds.push(federated)
    }
    gateway = await helper.createGatewayService({
      services: federateds.map((f, i) => ({
        name: `service${i + 1}`,
        url: `http://localhost:${f.port}/graphql`
      }))
    })

    for (const q of queries) {
      const result = await helper.query({
        query: q.query,
        variables: q.variables,
        url: `http://localhost:${gateway.port}/graphql`
      })

      t.same(result.data, q.expected)
    }
  })
}
