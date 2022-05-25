// Validates a single type object, e.g. { '@extend: true', '@directives': '...' }
function validateTypeObject(typeKey, typeObject) {
  const validTypes = {
    '@extend': 'boolean',
    '@directives': 'string'
  }

  if (typeof typeObject !== 'object') {
    throw new Error(
      `buildFederatedService: options type '${typeKey}' value must be an object`
    )
  }

  const validTypeKeys = Object.keys(validTypes)
  Object.keys(typeObject).forEach(key => {
    if (!validTypeKeys.includes(key)) {
      throw new Error(
        `buildFederatedService: options type '${typeKey}' value must contain a valid key, one of ${validTypeKeys
          .map(t => `'${t}'`)
          .join(', ')}`
      )
    }

    if (validTypes[key] !== typeof typeObject[key]) {
      throw new Error(
        `buildFederatedService: options type '${typeKey}' value '${key}' must be a ${validTypes[key]}`
      )
    }
  })
}

// Validates a single resolver object, e.g. { __resolveReference: () => {} }
function validateResolverObject(resolverKey, resolverObject) {
  if (typeof resolverObject !== 'object') {
    throw new Error(
      `buildFederatedService: options resolvers '${resolverKey}' value must be an object`
    )
  }
}

function validateOptions(options) {
  if (typeof options.auto !== 'boolean') {
    throw new Error('buildFederatedService: options auto must be a boolean')
  }

  if (options.type != null) {
    if (typeof options.type !== 'object') {
      throw new Error('buildFederatedService: options type must be an object')
    }

    Object.keys(options.type).forEach(type => {
      validateTypeObject(type, options.type[type])
    })
  }

  if (options.resolvers != null) {
    if (typeof options.resolvers !== 'object') {
      throw new Error(
        'buildFederatedService: options resolvers must be an object'
      )
    }

    Object.keys(options.resolvers).forEach(resolver => {
      validateResolverObject(resolver, options.resolvers[resolver])
    })
  }
}

function validateUrl(url) {
  if (!url) {
    throw new Error('buildFederatedService: url is required')
  }

  try {
    new URL(url)
  } catch (_) {
    throw new Error('buildFederatedService: url must be valid')
  }
}

module.exports = {
  validateOptions,
  validateUrl
}
