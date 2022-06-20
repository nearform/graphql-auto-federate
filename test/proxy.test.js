'use strict'

require('./setup')
const t = require('tap')
const dedent = require('dedent')
const clone = require('rfdc')()
const helper = require('./helper')

const { buildFederatedService } = require('../lib/federate')

const db = {
  _users: {
    1: { id: '1', name: 'Jimmy', fullName: 'James Morgan McGill' },
    2: { id: '2', name: 'Kim', fullName: 'Kimberly Wexler' },
    3: { id: '3', name: 'Amigo del cartel' }
  },
  _posts: {
    p1: { pid: 'p1', title: 'title', content: 'content' }
  }
}

const cases = [
  {
    name: 'should federate a "hello world" service',
    services: [
      {
        schema: dedent`
        type Query {
          hello (greeting: String!): String
          throwing (something: String!): String
        }`,
        resolvers: {
          Query: {
            hello: (_, args) => args.greeting,
            throwing: () => {
              throw new Error('kaboom')
            }
          }
        }
      }
    ],
    queries: [
      {
        query: '{ hello (greeting: "ciao") }',
        expected: { hello: 'ciao' }
      },
      {
        query: 'query Hello($message: String!) { hello (greeting: $message) }',
        variables: { message: 'ciao' },
        expected: { hello: 'ciao' }
      },
      {
        query: '{ throwing (something: "123") }',
        expected: { error: true }
      }
    ]
  },

  {
    name: 'should federate a basic service with a custom type',
    services: [
      {
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
            me: () => db.users[1],
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
        }
      }
    ],
    queries: [
      {
        query: '{ me { id, name, friends { fullName } } }',
        expected: {
          me: {
            id: '1',
            name: 'Jimmy',
            friends: [{ fullName: 'Amigo del cartel' }]
          }
        }
      },
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
  },

  {
    name: 'should federate a basic service with queries and mutations',
    services: [
      {
        schema: dedent`
        type Query {
          getUser (id: ID!): User
          getUsers: [User]!
        }

        type Mutation {
          setHello: String
          createUser (user: InputUser): User
          updateUser (id: ID!, user: InputUser): User
          deleteUser (id: ID!): ID
        }

        input InputUser {
          name: String!
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
            }
          },
          Mutation: {
            setHello: () => 'hello',
            createUser: (_, { user: inputUser }) => {
              const id = Object.keys(db.users).length + 1
              const user = { id, ...inputUser }
              db.users[id] = user
              return user
            },
            updateUser: (_, { id, user: inputUser }) => {
              db.users[id].name = inputUser.name
              return db.users[id]
            },
            deleteUser: (_, { id }) => {
              delete db.users[id]
              return id
            }
          },
          User: {
            friends: user => {
              return user.id == 1 ? [db.users[3]] : []
            },
            fullName: user => {
              return user.fullName || user.name
            }
          }
        }
      }
    ],
    queries: [
      {
        query: '{ getUser (id: "1") { id, name, friends { fullName } } }',
        expected: {
          getUser: {
            id: '1',
            name: 'Jimmy',
            friends: [{ fullName: 'Amigo del cartel' }]
          }
        }
      },
      {
        query: '{ getUsers { id, name, friends { fullName } } }',
        expected: {
          getUsers: [
            {
              id: '1',
              name: 'Jimmy',
              friends: [{ fullName: 'Amigo del cartel' }]
            },
            {
              id: '2',
              name: 'Kim',
              friends: []
            },
            {
              id: '3',
              name: 'Amigo del cartel',
              friends: []
            }
          ]
        }
      },
      {
        query: 'mutation { setHello }',
        expected: { setHello: 'hello' }
      },
      {
        query:
          'mutation { updateUser (id: 3, user: {name: "El cartel"}) { id, name, fullName } }',
        expected: {
          updateUser: {
            id: '3',
            name: 'El cartel',
            fullName: 'El cartel'
          }
        }
      },
      {
        query:
          'mutation { createUser (user: {name: "Nacho"}) { id, name, fullName } }',
        expected: {
          createUser: {
            id: '4',
            name: 'Nacho',
            fullName: 'Nacho'
          }
        }
      },
      {
        query: 'mutation { deleteUser (id: "4") }',
        expected: {
          deleteUser: '4'
        }
      }
    ]
  },

  {
    name: 'should federate 2 services with custom options',
    services: [
      {
        schema: dedent`
        type Query {
          me: User
          you: User
        }
        type User {
          id: ID!
          name: String!
          fullName: String
          avatar(size: AvatarSize): String
          friends: [User]
        }
        enum AvatarSize {
          small
          medium
          large
        }
        `,
        resolvers: {
          Query: {
            me: () => db.users['1'],
            you: () => db.users['2']
          },
          User: {
            avatar: (_, { size }) => `avatar-${size}.jpg`,
            friends: user =>
              Object.values(db.users).filter(u => u.id !== user.id),
            fullName: user => user.name + ' Doe'
          }
        },
        options: {
          auto: true,
          resolvers: {
            User: {
              __resolveReference: self => db.users[self.id]
            }
          }
        }
      },
      {
        schema: dedent`
        type Post {
          pid: ID!
          title: String
          content: String
        }
        input PostInput {
          title: String!
          content: String!
          authorId: String!
        }
        type Query {
          topPosts(count: Int): [Post]
        }
        type Mutation {
          createPost(post: PostInput!): Post
        }
        `,
        resolvers: {
          Query: {
            topPosts: (_, { count = 2 }) =>
              Object.values(db.posts).slice(0, count)
          },
          Mutation: {
            createPost: (_, { post }) => {
              const pid = `p${Object.values(db.posts).length + 1}`
              const result = { pid, ...post }
              db.posts[pid] = result
              return result
            }
          }
        },
        options: {
          auto: true,
          resolvers: {
            Post: {
              __resolveReference: self => db.posts[self.id]
            }
          }
        }
      }
    ],
    queries: [
      {
        query: '{ topPosts (count: 2) { pid, title } }',
        expected: { topPosts: [{ pid: 'p1', title: 'title' }] }
      },
      {
        query:
          '{ me { id, name, fullName, avatar(size: small), friends { name } } }',
        expected: {
          me: {
            id: '1',
            name: 'Jimmy',
            fullName: 'Jimmy Doe',
            avatar: 'avatar-small.jpg',
            friends: [{ name: 'Kim' }, { name: 'Amigo del cartel' }]
          }
        }
      }
    ]
  },

  {
    name: 'should federate a basic service with queries that use fragments',
    services: [
      {
        schema: dedent`
        type Query {
          me: User
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
            me: () => db.users[1]
          },
          User: {
            friends: () => [db.users[3]],
            fullName: user => user.fullName || user.name
          }
        }
      }
    ],
    queries: [
      {
        query: dedent`
        fragment CoreUserFields on User {
          id
          fullName
        }
        query {
          me {
            name
            ...CoreUserFields
            friends {
              ...CoreUserFields
            }
          }
        }`,
        expected: {
          me: {
            id: '1',
            name: 'Jimmy',
            fullName: 'James Morgan McGill',
            friends: [{ id: '3', fullName: 'Amigo del cartel' }]
          }
        }
      }
    ]
  },

  {
    name: 'should federate a basic service with an aliased query',
    services: [
      {
        schema: dedent`
        type Query {
          me: User
        }
        type User {
          id: ID!
          name: String!
        }
      `,
        resolvers: {
          Query: {
            me: () => db.users[1]
          }
        }
      }
    ],
    queries: [
      {
        query: '{ user: me { id, name } }',
        expected: {
          user: {
            id: '1',
            name: 'Jimmy'
          }
        }
      }
    ]
  },

  {
    name: 'should federate a basic service with aliased results',
    services: [
      {
        schema: dedent`
        type Query {
          getUser (id: ID!): User
        }
        type User {
          id: ID!
          name: String!
        }
      `,
        resolvers: {
          Query: {
            getUser: (_, args) => db.users[args.id]
          }
        }
      }
    ],
    queries: [
      {
        query:
          '{ jimmy: getUser (id: "1") { id, name }, kim: getUser (id: "2") { id, name } }',
        expected: {
          jimmy: {
            id: '1',
            name: 'Jimmy'
          },
          kim: {
            id: '2',
            name: 'Kim'
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

    for (const { schema, resolvers } of services) {
      const target = await helper.createService({ schema, resolvers })
      const federated = await helper.createFederatedService(
        await buildFederatedService({
          url: `http://localhost:${target.port}/graphql`
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

      if (q.expected.error) {
        t.ok(result.errors)
      } else {
        t.same(result.data, q.expected)
      }
    }
  })
}
