module.exports = {
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
}
