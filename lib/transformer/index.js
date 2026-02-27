'use strict'

const buildStandardGelf = require('./standard-gelf')

module.exports = function (opts) {
  return function (data) {
    const standardGelf = buildStandardGelf(data, opts)

    return Object.assign({}, standardGelf /*, expressGelf */)
  }
}
