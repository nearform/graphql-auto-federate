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
    expected: 'auto must be a boolean'
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
