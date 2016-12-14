module.exports = function (data) {
  return {
    version: '1.1',
    host: data.hostname,
    short_message: data.msg.substring(0, 65),
    full_message: data.msg,
    timestamp: data.time / 1000,
    level: utils.pinoLevelToSyslogLevel(data.level),
    facility: data.name
  }
}
