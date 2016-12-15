'use strict'

const fastJsonStringify = require('fast-json-stringify')
const through2 = require('through2')
const transform = require('./transform')
const Transport = require('./transport')
const utils = require('./utils')

module.exports = function (opts) {
  return through2.obj(function (data, enc, cb) {
    if(data.value) {
      const message = transform(data.value)
      const schema = utils.generateSchema(message)
      // const transport = new Transport(opts, schema)
      // transport.emit('log', message)
      const messageString = fastJsonStringify(schema)(message)
      setImmediate(function () { process.stdout.write(messageString) })
    }

    cb()
  })
}
