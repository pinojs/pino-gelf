'use strict'

const fastJsonStringify = require('fast-json-stringify')
const through2 = require('through2')
const transformer = require('./../transformer')
const Transport = require('./../transport')
const utils = require('./../utils')

module.exports = function (opts) {
  return through2.obj(function (data, enc, cb) {
    if (data.value) {
      const transform = transformer(opts)
      const message = transform(data.value)
      const transport = new Transport(opts)
      transport.emit('log', message)

      if (opts.verbose) {
        const stringify = utils.stringify(opts)
        const messageString = stringify(message)
        setImmediate(function () { process.stdout.write(messageString) })
      }
    }

    cb()
  })
}
