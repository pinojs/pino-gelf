'use strict'

var through2 = require('through2')
var utils = require('./utils')

function buildMessage (data) {
  var message = {
    version: '1.1',
    host: data.name,
    short_message: data.msg,
    full_message: data.msg,
    timestamp: data.time,
    level: utils.pinoLevelToSyslogLevel(data.level),
    _facility: data.hostname
  }

  return utils.stringify(message)
}

function transform () {
  return through2.obj(function (data, enc, cb) {
    var message = buildMessage(data)

    setImmediate(function () { process.stdout.write(message) })
    cb()
  })
}

module.exports = {
  buildMessage: buildMessage,
  transform: transform
}
