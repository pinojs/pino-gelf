var utils = require('../utils')

module.exports = function (data) {
  var gelf = {
    version: '1.1',
    host: data.hostname,
    short_message: data.msg.substring(0, 65),
    full_message: data.msg,
    timestamp: data.time,
    level: utils.pinoLevelToSyslogLevel(data.level),
    facility: data.name
  }

  return utils.stringify(gelf)
}
