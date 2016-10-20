'use strict'

var through2 = require('through2')
var utils = require('./utils')
var zlib = require('zlib')

function buildMessage (data) {
  var message = {
    version: '1.1',
    host: data.name,
    short_message: data.msg.substring(0, 65),
    full_message: data.msg,
    timestamp: data.time,
    level: utils.pinoLevelToSyslogLevel(data.level),
    _facility: data.hostname
  }

  return utils.stringify(message)
}

module.exports = function () {
  return through2.obj(function (data, enc, cb) {
    var message = buildMessage(data.value)
    var gzip = zlib.gzipSync(message)

    setImmediate(function () { process.stdout.write(gzip) })
    cb()
  })
}
