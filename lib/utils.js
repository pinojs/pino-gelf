'use strict'

var fastJsonStringify = require('fast-json-stringify')

var syslogLevel = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}

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

var stringify = fastJsonStringify({
  title: 'GELF Schema',
  type: 'object',
  properties: {
    version: {
      description: 'GELF spec version – “1.1”',
      type: 'string'
    },
    host: {
      description: 'the name of the host, source or application that sent this message',
      type: 'string'
    },
    short_message: {
      description: 'a short descriptive message',
      type: 'string'
    },
    full_message: {
      description: 'a long message that can i.e. contain a backtrace',
      type: 'string'
    },
    timestamp: {
      description: 'Seconds since UNIX epoch with optional decimal places for milliseconds',
      type: 'integer'
    },
    level: {
      description: 'the level equal to the standard syslog levels',
      type: 'integer'
    },
    _facility: {
      type: 'string'
    }
  }
})

module.exports = {
  pinoLevelToSyslogLevel: pinoLevelToSyslogLevel,
  stringify: stringify,
  syslogLevel: syslogLevel
}
