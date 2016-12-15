'use strict'

const fastJsonStringify = require('fast-json-stringify')
const through2 = require('through2')
const transform = require('./transform')
// const Transport = require('./transport')
const utils = require('./utils')

module.exports = function (opts) {
  return through2.obj(function (data, enc, cb) {
    if(data.value) {
      const message = transform(data.value)
      const transport = new Transport(opts)
      transport.emit('log', message)
      const messageString = utils.stringify(message)
      setImmediate(function () { process.stdout.write(messageString) })
    }

    cb()
  })
}
