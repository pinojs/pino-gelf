'use strict';

const crypto = require('crypto');
const deflate = require('zlib').deflate;
const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const utils = require('../utils');

var Udp = function (opts) {
  const self = this;

  self.config = _.pick(opts, [ 'host', 'port', 'maxChunkSize' ]);
  self.stringify = utils.stringify(opts);

  self.on('log', function (gelf) {
    const msg = self.stringify(gelf);

    self.compress(msg, function (buffer) {
      self.processMessage(buffer);
    });
  });
};

Udp.prototype = Object.create(EventEmitter.prototype, {
  constructor: { value: Udp }
});

Udp.prototype.compress = function (msg, cb) {
  deflate(msg, function (err, buf) {
    if(err) { cb && cb(null); }
    cb && cb(buf);
  });
};

Udp.prototype.prepareDatagrams = function (chunks, cb) {
  const datagrams = [];
  const gelfBytes = [ 0x1e, 0x0f ];
  const length = chunks.length;

  const createDatagramArray = function (msgId) {
    for(var i = 0; i < chunks.length; i++) {
      datagrams[i] =  Buffer.from(gelfBytes.concat(msgId, i, length, chunks[i]));
    }

    cb && cb(null, datagrams);
  };

  const randomBytesCallback = function (err, msgId) {
    if (err) { return; }
    createDatagramArray(msgId.slice());
  };

  const getRandomBytes = function () {
    crypto.randomBytes(8, randomBytesCallback);
  };

  getRandomBytes();
};

Udp.prototype.prepareMultipleChunks = function (msg, chunkSize) {
  const chunks = [];

  for(let i = 0; i < msg.length; i += chunkSize) {
    chunks.push(msg.slice(i, i + chunkSize));
  }

  return chunks;
};

Udp.prototype.processMultipleChunks = function (msg, chunkSize) {
  const self = this;

  const chunks = self.prepareMultipleChunks(msg, chunkSize);
  self.prepareDatagrams(chunks, function (err, datagrams) {
    process.nextTick(function () {
      self.sendMultipleMessages(datagrams);
    });
  });
};

Udp.prototype.processMessage = function (msg) {
  if (msg == null) return;

  const self = this;
  const maxChunkSize = self.config.maxChunkSize;

  if(msg.length > maxChunkSize) {
    self.processMultipleChunks(msg, maxChunkSize);
  } else {
    process.nextTick(function () { self.sendMessage(msg); });
  }
};

Udp.prototype.sendMultipleMessages = function (datagrams) {
  const self = this;

  for(var i = 0; i < datagrams.length; i++) {
    self.sendMessage(datagrams[i]);
  }
};

Udp.prototype.sendMessage = function (msg) {
  const self = this;
  const host = self.config.host;
  const port = self.config.port;
  const client = dgram.createSocket('udp4');

  client.send(msg, 0, msg.length, port, host, function () {
    try { client.close(); } catch (ex) { return; }
  });
};

module.exports = Udp;
