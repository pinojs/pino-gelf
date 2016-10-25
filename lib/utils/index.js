'use strict'

var fastJsonStringify = require('fast-json-stringify')
var gelfSchema = require('./gelf-schema')
var syslogLevel = require('./syslog-levels')

function pinoLevelToSyslogLevel (pinoLevel) {
  switch (pinoLevel) {
  case 10: // pino: trace
  case 20: // pino: debug
    return syslogLevel.debug
  case 30: // pino: info
    return syslogLevel.info
  case 40: // pino: warn
    return syslogLevel.warning
  case 50: // pino: error
    return syslogLevel.error
  default:
  case 60: // pino: fatal
    return syslogLevel.critical
  }
}

var stringify = fastJsonStringify(gelfSchema)

module.exports = {
  pinoLevelToSyslogLevel: pinoLevelToSyslogLevel,
  stringify: stringify
}
