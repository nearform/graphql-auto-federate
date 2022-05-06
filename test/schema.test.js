'use strict'

const t = require('tap')
const dedent = require('dedent')
const helper = require('./helper')

const { buildFederatedInfo } = require('../lib/federate')

const cases = [
  {
    name: 'should generate a federated schema for a simple query',
    schema: dedent`
      type Query {
        hello (greeting: String!): String
      }
      `,
    expected: dedent`
      extend type Query {
        hello (greeting: String!): String
      }`,
    options: {
      type: {
        Query: {
          '@extend': true
        }
      }
    }
  },

  {
    name: 'should generate a federated schema for a simple query using auto options',
    schema: dedent`
      type Query {
        hello (greeting: String!): String
      }
      `,
    expected: dedent`
      extend type Query {
        hello (greeting: String!): String
      }`,
    options: { auto: true }
  },

  {
    name: 'should federate an basic service with a custom type',
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

    expected: dedent`
    extend type Query {
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
    options: {
      type: {
        Query: {
          '@extend': true
        }
      }
    }
  },

  {
    name: 'should federate an basic service with @key directive',
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
    options: {
      type: {
        Query: {
          '@extend': true
        },
        User: {
          '@directives': '@key(fields: "id")'
        }
      }
    },

    expected: dedent`
    extend type Query {
      me: User
      you: User
    }
    type User @key(fields: "id") {
      id: ID!
      name: String!
      fullName: String
      friends: [User]
    }
    `
  },

  {
    name: 'should federate an basic service with enum',
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
    options: {
      type: {
        Query: {
          '@extend': true
        },
        User: {
          '@directives': '@key(fields: "id")'
        }
      }
    },

    expected: dedent`
    extend type Query {
      me: User
    }
    type User @key(fields: "id") {
      id: ID!
      name: String!
      avatar (size: AvatarSize): String
    }
    enum AvatarSize {
      small
      medium
      large
    }
    `
  },

  {
    name: 'should federate an complete service with mutations and directives',
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
        Mutation: {
          '@extend': true
        },
        User: {
          '@directives': '@key(fields: "id") @extends',
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
      }
    },

    expected: dedent`
    type Post @key(fields: "pid") {
      pid: ID!
      title: String
      content: String
      author: User @requires(fields: "pid title")
    }
    type Query @extends {
      topPosts (count: Int): [Post]
    }
    type User @key(fields: "id") @extends {
      id: ID! @external
      name: String @external
      posts: [Post]
      numberOfPosts: Int @requires(fields: "id name")
    }
    extend type Mutation {
      createPost (post: PostInput!): Post
      updateHello: String
    }
    input PostInput {
      title: String!
      content: String!
      authorId: String!
    }
    `
  }
]

for (const { name, schema, expected, options } of cases) {
  t.test(name, async t => {
    const federated = buildFederatedInfo({ schema, options })

    t.equal(federated.schema, expected)
    await helper.assertService(t, federated)
  })
}
