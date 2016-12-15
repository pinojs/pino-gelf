'use strict'

const _ = require('lodash')

function filterStandardKeys (data) {
  return Object
    .keys(data)
    .filter(function (key) { return key !== 'pid' })
    .filter(function (key) { return key !== 'hostname' })
    .filter(function (key) { return key !== 'name' })
    .filter(function (key) { return key !== 'level' })
    .filter(function (key) { return key !== 'time' })
    .filter(function (key) { return key !== 'msg' })
    .filter(function (key) { return key !== 'v' })
}

module.exports = function (data) {
  const customKeys = filterStandardKeys(data)
  return _.pick(data, customKeys)
}
