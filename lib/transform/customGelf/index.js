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
  const customGelf = _.pick(data, customKeys)

  if(_.has(customGelf, 'req')) {
    if(_.has(customGelf.req, 'headers')) {
      customGelf.req.headers = JSON.stringify(customGelf.req.headers)
    }
  }

  if(_.has(customGelf, 'res')) {
    if(_.has(customGelf.res, 'header')) {
      customGelf.res.header = JSON.stringify(customGelf.res.header)
    }
  }

  return customGelf
}
