'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const utils = require('../utils');
const http = require('http');
const https = require('https');

var Http = function (opts) {
  const self = this;

  self.config = _.pick(opts, [ 'host', 'port', 'protocol', 'keepAlive' ]);
  self.stringify = utils.stringify(opts);
  self.http = self.config.protocol === 'https' ? https : http;
  self.httpAgent = new self.http.Agent({
    keepAlive: self.config.keepAlive
  });

  self.on('log', function (gelf) {
    const msg = self.stringify(gelf);

    self.processMessage(msg);
  });
};

Http.prototype = Object.create(EventEmitter.prototype, {
  constructor: { value: Http }
});

Http.prototype.processMessage = function (msg) {
  if (msg == null) return;

  const self = this;
  process.nextTick(function () { self.sendMessage(msg); });
};

Http.prototype.sendMessage = function (msg) {
  const self = this;

  const req = self.http.request({
    port: self.config.port,
    hostname: self.config.host,
    path: '/gelf',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'Content-Length': Buffer.byteLength(msg)
    },
    agent: self.httpAgent
  });

  req.on('error', function() {});
  req.write(msg);
  req.end();
};

module.exports = Http;
