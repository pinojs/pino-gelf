'use strict'

const _ = require('lodash')

function mapProperty(value, key, message) {
  return {
    description: key,
    type: typeof key
  }
}

module.exports = function (message) {
  return {
    title: 'GELF Schema',
    type: 'object',
    properties: _.mapValues(message, mapProperty)
  }
}
