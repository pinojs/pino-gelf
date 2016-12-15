'use strict'

const _ = require('lodash')

module.exports = function (data, customKeys) {
  return _.pick(data, customKeys)
}
