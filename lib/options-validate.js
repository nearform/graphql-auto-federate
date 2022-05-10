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
}

module.exports = {
  validateOptions
}
