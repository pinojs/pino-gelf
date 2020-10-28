'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const utils = require('../utils');
const net = require('net');
const tls = require('tls');

var Tcp = function (opts) {
  const self = this;

  self.config = _.pick(opts, [ 'host', 'port', 'protocol', 'keepAlive', 'reconnectionLimit', 'reconnectionDelay' ]);
  self.stringify = utils.stringify(opts);
  self.net = self.config.protocol === 'tls' ? tls : net;
  self.reconnectionCount = 0;
  self.timeoutId = null;

  const options = {
    host: self.config.host,
    port: self.config.port,
    rejectUnauthorized: false
  };
  
  self.client = self.net.connect(options);

  process.on('SIGUSR1', function () { 
    self.client.destroy(); 
    self.client.unref();
  });

  if (self.config.keepAlive) self.client.setKeepAlive(true);

  self.client.on('connect', () => {
    self.reconnectionCount = 0;
  });

  self.client.on('error', () => {
    self.reconnectionCount++;
  });

  self.client.on('close', () => {
    if (self.config.reconnectionLimit < 0 || self.reconnectionCount < self.config.reconnectionLimit) {
      self.timeoutId = setTimeout(() => {
        self.timeoutId = null;
        self.client.connect(options);
      }, self.config.reconnectionDelay);
    }
  });

  self.on('log', function (gelf) {
    const msg = self.stringify(gelf);

    self.processMessage(msg);
  });
};

Tcp.prototype = Object.create(EventEmitter.prototype, {
  constructor: { value: Tcp }
});

Tcp.prototype.processMessage = function (msg) {
  if (msg == null) return;

  const self = this;
  process.nextTick(function () { self.sendMessage(msg); });
};

Tcp.prototype.sendMessage = function (msg) {
  const self = this;

  self.client.write(`${msg}\0`);
};

module.exports = Tcp;
