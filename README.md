# graphql-auto-federate

Automatically federate a GraphQL service

## Quick Start

```js
const fastify = require('fastify')
const mercurius = require('mercurius')
const { buildFederatedService } = require('graphql-auto-federate')

const federated = await buildFederatedService({
  url: `http://original-service:1234/graphql`
})

const federatedService = fastify()
federatedService.register(mercurius, {
  ...federated,
  federationMetadata: true,
  jit: 1
})
await federatedService.listen(3001)

const gateway = fastify()
gateway.register(mercurius, {
  services: [{ name: 'auto', url: `http://localhost:3001/graphql` }],
  jit: 1
})
await gateway.listen(3000)

// query the gateway @ port 3000
// curl -X POST -H 'content-type: application/json' -d '{ "query": "{ hello(greeting: \"ciao\") }" }' localhost:3000/graphql

```

## How it works

Given an existing GraphQL service, `graphql-auto-federate` reads the schema and build a new service with federation info that acts as a proxy, forwarding requests to the original service.

```txt
( gateway ) --> ( federated "proxy" service ) --> ( original service )
```

`graphql-auto-federate` can discover as much information as possible from the original service schema, anyway, more information should be provided to make it works properly.
It depends on the original schema, it may work out-of-the-box in a few cases, but usually should be added `__resolveReference` resolvers and `@directive` for the entity types (see [options](#options).

### __resolveReference

`__resolveReference` resolver is crucial for the make the federate service works properly.
Implementing `__resolveReference` for entities in this context (a "proxy" to federate an existing service) is not trivial and strongly depends on the schema and entities provided by the original service.

A special `forward` function is provided further with regular arguments to facilitate querying the original service (errors are already managed).

Example

```js
options: {
  resolvers: {
    User: {
      __resolveReference: async (self, args, context, info, forward) => {
        const response = await forward({
          query: `{ getUser (id: ${self.id}) { name, fullName } }`
        })

        return {
          ...response.getUser,
          ...self,
        }
      }
    }
  }
}
```

Note: in some cases, `__resolveReference` is even redundant, for example in `Query` resolvers, the original service provides all the needed information without needing to call `__resolveReference` again.

---

## API

### buildFederatedService

`buildFederatedService ({ url, options }) => { schema, resolvers }`

It creates the `{ schema, resolvers }` information to build the federated service.
It performs an `introspection query` to the original service, then elaborates the information to get the federated `schema` and `resolvers`.
`options` should contain additional information for `type` and `resolvers`, that are merged (and override) with the discovered ones.

Example

from original service schema

```gql
type Query {
  getUser (id: ID!): User
  getUsers: [User]!
}      

type Mutation {
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
```

```js
const { schema, resolvers } = await buildFederatedService({
  url: `http://original-service:1234/graphql` 
})
```

generated federated schema is

```gql
extend type Query {
  getUser (id: ID!): User
  getUsers: [User]!
}
extend type Mutation {
  createUser (user: InputUser): User
  updateUser (id: ID!, user: InputUser): User
  deleteUser (id: ID!): ID
}
input InputUser {
  name: String!
}
type User @key(fields: "id") {
  id: ID!
  name: String!
  fullName: String
  friends: [User]
}
```

generated federated resolvers are

```js
{
  Query: {
    getUser: (...) => // forward query
    getUsers: (...) => // forward query
  },
  Mutation: {
    createUser: (...) => // forward query
    updateUser: (...) => // forward query
    deleteUser: (...) => // forward query
  },
  User: { 
    __resolveReference: (self) => { console.warn('__resolveReference called', self) }
  }
}
```

#### url

the `url` of the original GraphQL service

#### options

- **auto** (boolean)

`auto` option discovers the schema from the original service and builds the relative federated `schema` and `resolvers` (_default_: `true`)

- **type**

Inject information to type definition schema, adding `@extend` or `@directives` for entity types, merged (and override) the `auto` discovered ones if any.

- `@extend` (boolean) add "extend" to the type
- `@directives` (string) add directives as a string to the type, see [federation spec](https://www.apollographql.com/docs/federation/federation-spec/#federation-schema-specification) for supported directives

Example

from original service schema

```gql
type Query {
  getUser (id: ID!): User
  getUsers: [User]!
}      
type User {
  id: ID!
  name: String!
  fullName: String
}
```

using options

```js
options: {
  auto: false,
  type: {
    Query: {
      '@extend': true
    },
    User: {
      '@directives': '@key(fields: "id") @external'
    }
  }
}
```

generated federated schema

```gql
extend type Query {
  getUser (id: ID!): User
  getUsers: [User]!
}
type User @key(fields: "id") @external {
  id: ID!
  name: String!
  fullName: String
}
```

- **resolvers**

Provide `resolvers`, merged (and override) the `auto` discovered ones if any.

---

## Supported features

Automatic generation of federated schema supports

- [x] queries
- [x] mutations
- [x] entities
- [x] scalar types
- [x] enums
- [x] unions
- [x] directives

## TODO

v. 0.2

- [ ] param validations
- [ ] `options.loaders`
- [ ] headers in `graphqlRequest`
- [ ] improve `__resolveReference` resolution
  - [ ] provide fields that need to be resolved (from `context.__currentQuery`?)
  - [ ] (from mercurius gateway) do not query `__resolveReference` if not necessary
- [ ] 100% test coverage
  - [ ] forwarded queries with fragmentes and alias (probably already supported, write test)
- [ ] use a model for __resolveReference `{ query, variables, transform (jsonata) }`
- [ ] more advanced examples in "How it works" section
- [ ] support subscriptions in schema/resolvers
- [ ] comments in federated schema
- [ ] jsdoc and type check
- [ ] expose `buildFederatedInfo` and document it
