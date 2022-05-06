'use strict'

const t = require('tap')
const dedent = require('dedent')
const graphql = require('graphql')

const { autoOptions } = require('../lib/options')

const cases = [
  {
    name: 'should generate options for a federated schema with a simple query',
    schema: dedent`
      type Query {
        hello (greeting: String!): String
      }
      `,
    expected: {
      type: {
        Query: {
          '@extend': true
        }
      },
      resolvers: {}
    }
  },

  {
    name: 'should generate options for a basic service with a custom type',
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
    expected: {
      type: {
        Query: {
          '@extend': true
        },
        User: {
          '@directives': '@key(fields: "id")'
        }
      },
      resolvers: {
        User: {
          __resolveReference: function () {}
        }
      }
    }
  },

  {
    name: 'should generate options for a basic service with @key directive',
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
    expected: {
      type: {
        Query: {
          '@extend': true
        },
        User: {
          '@directives': '@key(fields: "id")'
        }
      },
      resolvers: {
        User: {
          __resolveReference: function () {}
        }
      }
    }
  },

  {
    name: 'should generate options for a basic service with enum',
    schema: dedent`
    type Query {
      me: User
    }
    type User {
      id: ID!
      name: String!
      avatar(size: AvatarSize): String
    }
    enum AvatarSize {
      small
      medium
      large
    }
    `,
    expected: {
      type: {
        Query: {
          '@extend': true
        },
        User: {
          '@directives': '@key(fields: "id")'
        }
      },
      resolvers: {
        User: {
          __resolveReference: function () {}
        }
      }
    }
  },

  {
    name: 'should generate options for a complete service with mutations and directives',
    schema: dedent`
    type Post {
      pid: ID!
      title: String
      content: String
      author: User
    }

    type Query {
      topPosts(count: Int): [Post]
    }

    type User {
      id: ID!
      name: String
      posts: [Post]
      numberOfPosts: Int
    }

    type Mutation {
      createPost(post: PostInput!): Post
      updateHello: String
    }

    input PostInput {
      title: String!
      content: String!
      authorId: String!
    }
    `,
    options: {
      type: {
        Query: {
          '@directives': '@extends'
        },
        User: {
          '@directives': '@extends',
          id: {
            '@directives': '@external'
          },
          name: {
            '@directives': '@external'
          },
          numberOfPosts: {
            '@directives': '@requires(fields: "id name")'
          }
        },
        Post: {
          author: {
            '@directives': '@requires(fields: "pid title")'
          }
        }
      }
    },
    expected: {
      type: {
        Query: {
          '@directives': '@extends'
        },
        Mutation: {
          '@extend': true
        },
        User: {
          '@directives': '@extends @key(fields: "id")',
          id: {
            '@directives': '@external'
          },
          name: {
            '@directives': '@external'
          },
          numberOfPosts: {
            '@directives': '@requires(fields: "id name")'
          }
        },
        Post: {
          '@directives': '@key(fields: "pid")',
          author: {
            '@directives': '@requires(fields: "pid title")'
          }
        }
      },
      resolvers: {
        Post: {
          __resolveReference: function () {}
        },
        User: {
          __resolveReference: function () {}
        }
      }
    }
  }
]

for (const { name, schema, resolvers, options, expected } of cases) {
  t.test(name, async t => {
    const result = autoOptions({
      options,
      schema: graphql.buildSchema(schema),
      resolvers
    })

    t.same(result.type, expected.type)
    for (const type of Object.keys(expected.resolvers)) {
      t.type(result.resolvers[type].__resolveReference, 'function')
      t.type(expected.resolvers[type].__resolveReference, 'function')
    }
  })
}
