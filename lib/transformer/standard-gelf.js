const utils = require('./../utils')

module.exports = function (data, opts) {
  const messageKey = (opts && opts.messageKey) || 'msg'
  const mandatoryPayload = {
    version: '1.1',
    host: '0.0.0.0',
    short_message: '[empty message]',
  }

  const payload = {}

  if (typeof data.hostname === 'string') {
    payload.host = data.hostname
  }

  if (typeof data[messageKey] === 'string') {
    payload.short_message = data[messageKey].substring(0, 65)
    payload.full_message = data[messageKey]
  } else if (typeof data[messageKey] !== 'undefined') {
    payload.full_message = JSON.stringify(data[messageKey])
  }

  if (typeof data.time === 'number') {
    payload.timestamp = data.time / 1000
  }

  if (typeof data.level === 'number') {
    payload.level = utils.pinoLevelToSyslogLevel(data.level)
  }

  // Add all additional fields as underscore prefixed string values
  for (const [key, value] of Object.entries(data)) {
    // console.log(key, value)
    if (!['hostname', messageKey, 'time', 'level', 'pid', 'v'].includes(key)) {
      payload[`_${key}`] = typeof value === 'string' ? value : JSON.stringify(value)
    }
  }

  return Object.assign({}, mandatoryPayload, payload)
}
