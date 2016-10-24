'use strict'

var Gelf = require('gelf')
var through2 = require('through2')
var utils = require('./utils')

var client = new Gelf({
  graylogPort: 12201,
  graylogHostname: '127.0.0.1',
  connection: 'wan',
  maxChunkSizeWan: 1420,
  maxChunkSizeLan: 8154
})

function buildMessage (data) {
  var message = {
    version: '1.1',
    host: data.hostname,
    short_message: data.msg.substring(0, 65),
    full_message: data.msg,
    timestamp: data.time,
    level: utils.pinoLevelToSyslogLevel(data.level),
    facility: data.name
  }

  return utils.stringify(message)
}

module.exports = function () {
  return through2.obj(function (data, enc, cb) {
    if(data.value) {
      var message = buildMessage(data.value)
      client.emit('gelf.log', message)
      setImmediate(function () { process.stdout.write(message) })
    }

    cb()
  })
}
