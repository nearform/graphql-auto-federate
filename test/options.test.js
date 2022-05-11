'use strict'

const t = require('tap')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

const { buildFederatedService } = require('../')

const defaultFailureCase = {
  url: 'http://localhost'
}

const failureCases = [
  {
    name: 'url is required',
    url: '',
    expected: 'url is required'
  },
  {
    name: 'auto boolean',
    options: { auto: '' },
    expected: 'options auto must be a boolean'
  },
  {
    name: 'type must be an object',
    options: { type: '' },
    expected: 'options type must be an object'
  },
  {
    name: 'type entry must be an object',
    options: { type: { Query: '' } },
    expected: `options type 'Query' value must be an object`
  },
  {
    name: 'type entry must contain valid key',
    options: { type: { Query: { '@invalid': true } } },
    expected: `options type 'Query' value must contain a valid key, one of '@extend', '@directives'`
  },
  {
    name: 'type entry @extend must be a boolean',
    options: { type: { Query: { '@extend': '' } } },
    expected: `options type 'Query' value '@extend' must be a boolean`
  },
  {
    name: 'type entry @directives must be a string',
    options: { type: { Query: { '@directives': false } } },
    expected: `options type 'Query' value '@directives' must be a string`
  },
  {
    name: 'resolvers must be an object',
    options: { resolvers: '' },
    expected: 'options resolvers must be an object'
  },
  {
    name: 'resolvers entry must be an object',
    options: { resolvers: { User: '' } },
    expected: `options resolvers 'User' value must be an object`
  },
  {
    name: 'resolvers entry must have a reference resolver',
    options: { resolvers: { User: {} } },
    expected: `options resolvers 'User' value must have a reference resolver`
  }
]

for (const {
  name,
  url: caseUrl,
  options: caseOptions,
  expected
} of failureCases) {
  const { url, options } = mergeOptions(defaultFailureCase, {
    url: caseUrl,
    options: caseOptions
  })

  t.test(name, async t => {
    try {
      await buildFederatedService({ url, options })
    } catch (err) {
      t.match(err.message, `buildFederatedService: ${expected}`)
    }
    t.end()
  })
}
