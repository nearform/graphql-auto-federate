'use strict'

const graphql = require('graphql')
const { kType, kName, kArgs, kDirectives, kDefault } = require('./symbol')

// TODO jsdoc and unit tests

function formatAstArguments(args) {
  if (!args || args.length < 1) {
    return ''
  }
  return ` (${args
    .map(arg => `${arg.name.value}: ${formatAstValue(arg.value)}`)
    .join(', ')})`
}

function formatAstValue(value) {
  if (value.kind == graphql.Kind.STRING) {
    return `"${value.value}"`
  }
  return value.value
}

function formatAstDirective(directive) {
  return `@${directive.name.value}${formatAstArguments(directive.arguments)}`
}

function formatAstValues(values) {
  return values.map(v => `  ${v.name.value}`).join('\n')
}

function formatAstTypes(types) {
  return types.map(t => t.name.value).join(' | ')
}

function formatArgs(args) {
  if (!args || args.length < 1) {
    return ''
  }
  return ` (${args
    .map(
      arg =>
        `${arg[kName]}: ` +
        `${formatType(arg[kType])}${formatDefaultValue(arg[kDefault])}`
    )
    .join(', ')})`
}

function formatDefaultValue(defaultValue, field) {
  if (defaultValue === undefined) {
    return ''
  }

  if (field || typeof defaultValue == 'object') {
    return ` = ${JSON.stringify(defaultValue)}`
  }
  return ` = ${defaultValue}`
}

function formatType(type) {
  if (type instanceof graphql.GraphQLNonNull) {
    return formatType(type.ofType) + '!'
  } else if (type instanceof graphql.GraphQLList) {
    return '[' + formatType(type.ofType) + ']'
  }

  if (type.ofType) {
    return formatType(type.ofType)
  }

  return type.name
}

function formatExtend(extend) {
  return extend ? 'extend ' : ''
}

function formatDirectives(type) {
  let astDirectives = ''
  if (type[kDirectives] && type[kDirectives].length > 0) {
    astDirectives =
      type[kDirectives].map(d => formatAstDirective(d)).join(' ') + ' '
  }

  return astDirectives + (type['@directives'] || '')
}

function formatField(field) {
  let directives = formatDirectives(field)
  if (directives) directives = ' ' + directives

  return (
    `  ${field[kName]}${formatArgs(field[kArgs])}: ` +
    `${formatType(field[kType])}${formatDefaultValue(
      field[kDefault],
      true
    )}${directives}`
  )
}

function formatTypeDeclarationOpen(type) {
  let directives = formatDirectives(type)
  if (directives) directives = ' ' + directives
  let open
  if (type[kType] == 'scalar') {
    open = ''
  } else if (type[kType] == 'union') {
    open = ' ='
  } else {
    open = ' {'
  }

  return `${formatExtend(type['@extend'])}${type[kType]} ${
    type[kName]
  }${directives}${open}`
}

function formatTypeDeclarationClose(type) {
  return type[kType] != 'scalar' && type[kType] != 'union' ? '}' : ''
}

module.exports = {
  formatAstValues,
  formatAstTypes,

  formatArgs,
  formatType,
  formatDirectives,
  formatExtend,
  formatField,
  formatTypeDeclarationOpen,
  formatTypeDeclarationClose
}
