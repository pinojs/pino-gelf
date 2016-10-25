'use strict'

// var Gelf = require('gelf')
var through2 = require('through2')
var transform = require('./transform')
var Transport = require('./transport')

var transport = new Transport()

module.exports = function () {
  return through2.obj(function (data, enc, cb) {
    if(data.value) {
      var gelf = transform(data.value)
      transport.emit('log', gelf)
      setImmediate(function () { process.stdout.write(gelf) })
    }

    cb()
  })
}
