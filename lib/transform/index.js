'use strict'

const buildCustomGelf = require('./customGelf')
const buildStandardGelf = require('./standardGelf')

module.exports = function (data) {
  const standardGelf = buildStandardGelf(data)
  const customGelf = buildCustomGelf(data)

  return Object.assign({}, standardGelf, customGelf)
}
