'use strict'

const graphql = require('graphql')
const clone = require('rfdc')()
const mergeOptions = require('merge-options')
const {
  formatField,
  formatTypeDeclarationOpen,
  formatTypeDeclarationClose,
  formatAstValues,
  formatAstTypes
} = require('./format')
const { autoOptions } = require('./options')
const { graphqlRequest, createGraphqlRequest } = require('./network')
const {
  kType,
  kName,
  kValues,
  kFields,
  kArgs,
  kDirectives,
  kTypes,
  kDefault
} = require('./symbol')

// TODO jsdoc and unit tests

const retrieveSchemaType = {
  [graphql.Kind.OBJECT_TYPE_DEFINITION]: ({ typeName, type }) => {
    return {
      [kType]: 'type',
      [kName]: typeName,
      [kDirectives]: type.astNode.directives,
      [kFields]: retrieveFields(type)
    }
  },
  [graphql.Kind.INPUT_OBJECT_TYPE_DEFINITION]: ({ typeName, type }) => {
    return {
      [kType]: 'input',
      [kName]: typeName,
      [kDirectives]: type.astNode.directives,
      [kFields]: retrieveFields(type)
    }
  },
  [graphql.Kind.SCALAR_TYPE_DEFINITION]: ({ typeName, type }) => {
    return {
      [kType]: 'scalar',
      [kName]: typeName,
      [kDirectives]: type.astNode.directives
    }
  },
  [graphql.Kind.ENUM_TYPE_DEFINITION]: ({ typeName, type }) => {
    return {
      [kType]: 'enum',
      [kName]: typeName,
      [kDirectives]: type.astNode.directives,
      [kValues]: type.astNode.values
    }
  },
  [graphql.Kind.UNION_TYPE_DEFINITION]: ({ typeName, type }) => {
    return {
      [kType]: 'union',
      [kName]: typeName,
      [kDirectives]: type.astNode.directives,
      [kTypes]: type.astNode.types
    }
  }
}

function createFieldInfo(field) {
  return {
    [kName]: field.name,
    [kType]: field.type,
    [kDefault]: field.defaultValue
  }
}

function retrieveFields(type) {
  if (!type._fields) {
    return []
  }
  const fields = []
  for (const fieldName of Object.keys(type._fields)) {
    const field = type._fields[fieldName]

    fields.push({
      ...createFieldInfo(field),
      [kArgs]: field.args?.map(createFieldInfo)
    })
  }
  return fields
}

function retrieveSchemaInfo(serviceSchema) {
  const types = []

  for (const typeName of Object.keys(serviceSchema._typeMap)) {
    const type = serviceSchema._typeMap[typeName]

    if (!type.astNode) {
      continue
    }

    const retrieve = retrieveSchemaType[type.astNode.kind]
    if (!retrieve) {
      continue
    }

    const typeInfo = retrieve({ typeName, type })
    if (typeInfo) {
      types.push(typeInfo)
    }
  }
  return { types }
}

/**
 * TODO description
 * build federated schema, with resolvers
 * @return {schema: string, resolvers: Object}
 */
function buildFederated({ types, resolvers, options }) {
  const schema = []

  for (let type of types) {
    const optionsType = options?.type && options?.type[type[kName]]
    if (optionsType) {
      type = mergeOptions(type, optionsType)
    }

    schema.push(formatTypeDeclarationOpen(type))

    if (type[kFields]) {
      for (let field of type[kFields]) {
        if (optionsType && optionsType[field[kName]]) {
          field = mergeOptions(field, optionsType[field[kName]])
        }
        schema.push(formatField(field))
      }
    }

    if (type[kValues]) {
      schema.push(formatAstValues(type[kValues]))
    }

    if (type[kTypes]) {
      schema.push(formatAstTypes(type[kTypes]))
    }

    const close = formatTypeDeclarationClose(type)
    close && schema.push(close)
  }

  return {
    schema: schema.join('\n'),
    resolvers: options?.resolvers
      ? mergeOptions(resolvers, options?.resolvers)
      : resolvers,
    options
  }
}

function buildFederation({ schema, resolvers, options }) {
  const { types } = retrieveSchemaInfo(schema)
  return buildFederated({ types, resolvers, options })
}

/**
 * TODO description, examples
 * @param {string|graphql.GraphQLSchema} schema
 * @param {Object} options
 * @param {?boolean} [options.auto=false] - add default options to federate the schema, merging with the provided
 */
function buildFederatedInfo({ schema, resolvers, options }) {
  // TODO validate options, handle errors

  // TODO check graphql schema version! > log warning
  // it will not work with a different version of graphql, since "instanceof" is used
  // *** it's very hard to debug ***
  // alternatively, we can stringify the schema (with graphql.printSchema) and build it again
  // behind an option "rebuild" or something
  if (typeof schema == 'string') {
    schema = graphql.buildSchema(schema)
  }

  if (options?.auto) {
    options = autoOptions({ options, schema, resolvers })
  }

  return buildFederation({
    schema,
    resolvers,
    // TODO loaders
    options
  })
}

/**
 * @param resolvers mutable
 */
function buildResolvers(resolvers, typeName, schemaType, url) {
  if (!schemaType) {
    return
  }
  const queries = Object.keys(schemaType._fields)
  if (queries.length < 1) {
    return
  }

  if (!resolvers[typeName]) {
    resolvers[typeName] = {}
  }
  for (const query of Object.keys(schemaType._fields)) {
    if (resolvers[typeName][query]) {
      continue
    }
    resolvers[typeName][query] = createGraphqlRequest(url, query)
  }
}

function buildFederatedResolvers({ url, schema, resolvers }) {
  // TODO validate options, handle errors
  const federatedResolvers = clone(resolvers)

  buildResolvers(federatedResolvers, 'Query', schema._queryType, url)
  buildResolvers(federatedResolvers, 'Mutation', schema._mutationType, url)
  // TODO subscriptions

  return federatedResolvers
}

async function buildFederatedService({ url, options }) {
  // TODO validate args, handle errors

  if (!options) {
    options = { auto: true }
  }

  const introspectionSchema = await graphqlRequest({
    url,
    query: graphql.getIntrospectionQuery()
  })

  // rebuild schema from introspection
  const targetSchema = graphql.buildSchema(
    graphql.printSchema(graphql.buildClientSchema(introspectionSchema.data))
  )
  const federated = buildFederatedInfo({
    schema: targetSchema,
    resolvers: {},
    options
  })

  federated.resolvers = buildFederatedResolvers({
    url,
    schema: targetSchema,
    resolvers: federated.resolvers,
    options: federated.options
  })

  return federated
}

module.exports = { buildFederatedInfo, buildFederatedService }
