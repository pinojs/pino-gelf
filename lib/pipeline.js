'use strict';

const through2 = require('through2');
const transformer = require('./transformer');
const utils = require('./utils');
const Udp = require('./transports/udp');
const Http = require('./transports/http');
const Tcp = require('./transports/tcp');

module.exports = function (opts) {
  let transport;
  switch(opts.protocol) {
  case 'udp':
    transport = new Udp(opts);
    break;
  case 'http':
  case 'https':
    transport = new Http(opts);
    break;
  case 'tcp':
  case 'tls':
    transport = new Tcp(opts);
    break;
  }

  return through2.obj(function (data, enc, cb) {
    if (data.value) {
      const transform = transformer(opts);
      const message = transform(data.value);

      if (opts.passthrough) {
        // Pass original input back to stdout to allow chaining of multiple commands
        setImmediate(function () { process.stdout.write(`${JSON.stringify(data.value)}\n`); });
      } else if (opts.verbose) {
        const stringify = utils.stringify(opts);
        const messageString = stringify(message);
        setImmediate(function () { process.stdout.write(`${messageString}\n`); });
      }

      transport.emit('log', message);
    }

    cb();
  });
};
