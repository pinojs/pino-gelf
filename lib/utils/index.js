'use strict';

const standardSchema = require('./schema/standard');
const fastJsonStringify = require('fast-json-stringify');
const syslogLevel = require('./syslog');

function pinoLevelToSyslogLevel (pinoLevel) {
  switch (pinoLevel) {
  case 10: // pino: trace
  case 20: // pino: debug
    return syslogLevel.debug;
  case 30: // pino: info
    return syslogLevel.info;
  case 40: // pino: warn
    return syslogLevel.warning;
  case 50: // pino: error
    return syslogLevel.error;
  default:
  case 60: // pino: fatal
    return syslogLevel.critical;
  }
}

const stringify = function (opts) {
  let schema = standardSchema;

  if (opts.customKeys.length > 0) {
    const customSchema = {
      title: 'GELF Schema',
      type: 'object',
      properties: {}
    };

    opts.customKeys.forEach(function (customKey) {
      customSchema.properties[customKey] = { type: 'string' };
    });

    schema.properties = Object.assign(schema.properties, customSchema.properties);
  }

  return fastJsonStringify(schema);
};

module.exports = {
  pinoLevelToSyslogLevel: pinoLevelToSyslogLevel,
  stringify: stringify
};
