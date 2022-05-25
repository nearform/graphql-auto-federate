'use strict'

const undici = require('undici')
const { ErrorWithProps } = require('mercurius')

// TODO jsdoc and unit tests

async function _request({ url, headers = {}, query, variables }) {
  const response = await undici.request(url, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers: {
      ...headers,
      'content-type': 'application/json'
    }
  })

  return {
    statusCode: response.statusCode,
    headers: response.headers,
    body: await response.body.json()
  }
}

/**
 * TODO options: timeout
 * TODO return also headers?
 */
async function graphqlRequest({ url, headers, query, variables }) {
  try {
    const response = await _request({ url, headers, query, variables })

    return response.body
  } catch (err) {
    return {
      errors: [err]
    }
  }
}

function createGraphqlRequest(url, query) {
  // eslint-disable-next-line no-unused-vars
  return async function _forwardGraphqlRequest(parent, args, context, info) {
    // TODO forward headers, add options, for example: forward only Authorization
    const response = await graphqlRequest({
      url,
      query: context.__currentQuery,
      variables: info.variableValues
    })

    if (response.errors) {
      throw new ErrorWithProps('Error on query', response.errors)
    }

    return response.data[query]
  }
}

/**
 * exposed function with simplified interface for graphql queries from custom resolvers, for example from __resolveReference
 */
async function forward({ url, headers, query, variables }) {
  const response = await graphqlRequest({ url, headers, query, variables })

  if (response.errors) {
    throw new ErrorWithProps('Error on query', response.errors)
  }

  return response.data
}

function bindForwardClient(url) {
  return function bindForwardClient({ headers, query, variables }) {
    return forward({ url, headers, query, variables })
  }
}

module.exports = {
  forward,
  bindForwardClient,
  graphqlRequest,
  createGraphqlRequest
}
