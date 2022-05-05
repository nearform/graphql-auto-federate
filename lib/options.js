'use strict'

const graphql = require('graphql')
const clone = require('rfdc')()

// TODO jsdoc and unit tests

function isEntityType(type) {
  return (
    type.name.substr(0, 2) != '__' &&
    !isEntryPointType(type.name) &&
    graphql.isObjectType(type) &&
    Object.keys(type._fields).length > 0
  )
}

function isEntryPointType(typeName) {
  return (
    typeName == 'Query' || typeName == 'Mutation' || typeName == 'Subscription'
  )
}

function isExtendDefined(typeName, options) {
  if (!options.type[typeName]) {
    return false
  }

  if ('@extend' in options.type[typeName]) {
    return true
  }

  if (
    options.type[typeName]['@directives'] &&
    options.type[typeName]['@directives'].includes('@extends')
  ) {
    return true
  }

  return false
}

function isKeyDefined(typeName, options) {
  if (!options.type[typeName]) {
    return false
  }

  if (
    '@directives' in options.type[typeName] &&
    options.type[typeName]['@directives'].includes('@key')
  ) {
    return true
  }

  return false
}

function addExtendToType(options, typeName) {
  if (!options.type[typeName]) {
    options.type[typeName] = { '@extend': true }
    return
  }
  options.type[typeName]['@extend'] = true
}

function addKeyToType(options, type, typeName, schema) {
  const key = getKey(type, schema)
  if (!options.type[typeName]) {
    options.type[typeName] = { '@directives': `@key(fields: "${key}")` }
    return
  }
  if (!options.type[typeName]['@directives']) {
    options.type[typeName]['@directives'] = `@key(fields: "${key}")`
    return
  }
  options.type[typeName]['@directives'] += ` @key(fields: "${key}")`
}

/**
 * set automatic key for the type, lookin for (in order)
 * - the first field of type ID
 * - the first field of scalar type
 * - the key of a entity field (recursive)
 */
function getKey(type, schema) {
  const fields = Object.keys(type._fields)

  // look for a field of type ID
  for (const fieldName of fields) {
    const field = type._fields[fieldName]
    const fieldType = field.type.name || field.type.ofType.name
    if (fieldType == 'ID') {
      return fieldName
    }
  }

  for (const fieldName of fields) {
    const field = type._fields[fieldName]
    const fieldType = field.type.name || field.type.ofType.name

    // skip arrays
    if (schema._typeMap[fieldType] instanceof graphql.GraphQLList) {
      continue
    }

    // if it's not scalar type, get its key (recursive)
    if (schema._typeMap[fieldType] instanceof graphql.GraphQLScalarType) {
      return fieldName
    }

    if (schema._typeMap[fieldType]) {
      return `${fieldName} { ${getKey(schema._typeMap[fieldType], schema)} }`
    }
  }

  return fields[0]
}

function isResolveReferenceDefined(typeName, options, resolvers) {
  return Boolean(
    (options.resolvers[typeName] &&
      options.resolvers[typeName].__resolveReference) ||
      (resolvers &&
        resolvers[typeName] &&
        resolvers[typeName].__resolveReference)
  )
}

function addResolveReference(options, typeName) {
  if (!options.resolvers[typeName]) {
    options.resolvers[typeName] = {}
  }
  options.resolvers[typeName].__resolveReference =
    // eslint-disable-next-line no-unused-vars
    function (self, args, context, info) {
      console.warn('__resolveReference called', self)
    }
}

/**
 * add common options to federate a non-federated schema
 * for Query, Mutation and Subscription, add @extend if not already present in options
 * for Entities, add directive '@key(fields: "${key}")' to options
 */
function autoOptions({ schema, resolvers, options }) {
  if (!options) {
    options = { type: {}, resolvers: {} }
  } else {
    options = clone(options)
    if (!options.type) {
      options.type = {}
    }
    if (!options.resolvers) {
      options.resolvers = {}
    }
  }

  for (const typeName of Object.keys(schema._typeMap)) {
    const type = schema._typeMap[typeName]

    // if (!type.astNode) {
    //   continue
    // }

    if (isEntryPointType(typeName)) {
      if (!isExtendDefined(typeName, options)) {
        addExtendToType(options, typeName)
      }
    } else if (isEntityType(type)) {
      if (!isKeyDefined(typeName, options)) {
        addKeyToType(options, type, typeName, schema)
      }
      if (!isResolveReferenceDefined(typeName, options, resolvers)) {
        addResolveReference(options, typeName)
      }
    }
  }

  return options
}

module.exports = { autoOptions }
