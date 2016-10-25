'use strict'

var through2 = require('through2')
var transform = require('./transform')
var Transport = require('./transport')
var utils = require('./utils')

module.exports = function (opts) {
  var transport = new Transport(opts)

  return through2.obj(function (data, enc, cb) {
    if(data.value) {
      var message = transform(data.value)
      transport.emit('log', message)
      var messageString = utils.stringify(message)
      setImmediate(function () { process.stdout.write(messageString) })
    }

    cb()
  })
}
