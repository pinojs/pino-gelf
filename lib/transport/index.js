'use strict'

const crypto = require('crypto')
const defaults = require('./opts')
const deflate = require('zlib').deflate
const dgram = require('dgram')
const EventEmitter = require('events').EventEmitter
const _ = require('lodash')
const utils = require('../utils')

var Transport = function (opts) {
  const self = this

  self.config = Object.assign({}, defaults, opts)

  self.on('log', function (gelf) {
    const msg = utils.stringify(gelf)

    self.compress(msg, function (buffer) {
      self.processMessage(buffer)
    })
  })
}

Transport.prototype = Object.create(EventEmitter.prototype, {
  constructor: { value: Transport }
})

Transport.prototype.compress = function (msg, cb) {
  deflate(msg, function (err, buf) {
    if(err) {
      throw err
    }

    cb && cb(buf)
  })
}

Transport.prototype.prepareDatagrams = function (chunks, cb) {
  const datagrams = []
  const gelfBytes = [ 0x1e, 0x0f ]
  const length = chunks.length

  const createDatagramArray = function (msgId) {
    for(var i = 0; i < chunks.length; i++) {
      datagrams[i] = new Buffer(gelfBytes.concat(msgId, i, length, chunks[i]))
    }

    cb && cb(null, datagrams)
  }

  const randomBytesCallback = function (err, msgId) {
    if(err) {
      throw err
    }

    createDatagramArray(Array.prototype.slice.call(msgId))
  }

  const getRandomBytes = function () {
    crypto.randomBytes(8, randomBytesCallback)
  }

  getRandomBytes()
}

Transport.prototype.prepareMultipleChunks = function (msg, chunkSize) {
  const chunks = []

  for(var i = 0; i < msg.length; i += chunkSize) {
    chunks.push(Array.prototype.slice.call(msg, i, i + chunkSize))
  }

  return chunks
}

Transport.prototype.processMultipleChunks = function (msg, chunkSize) {
  const self = this

  const chunks = self.prepareMultipleChunks(msg, chunkSize)
  self.prepareDatagrams(chunks, function (err, datagrams) {
    process.nextTick(function () {
      self.sendMultipleMessages(datagrams)
    })
  })
}

Transport.prototype.processMessage = function (msg) {
  const self = this
  const maxChunkSize = self.config.maxChunkSize

  if(msg.length > maxChunkSize) {
    self.processMultipleChunks(msg, maxChunkSize)
  } else {
    process.nextTick(function () {
      self.sendMessage(msg)
    })
  }
}

Transport.prototype.sendMultipleMessages = function (datagrams) {
  const self = this

  for(var i = 0; i < datagrams.length; i++) {
    self.sendMessage(datagrams[i])
  }
}

Transport.prototype.sendMessage = function (msg) {
  const self = this
  const host = self.config.host
  const port = self.config.port
  const client = dgram.createSocket('udp4')

  /* eslint-disable no-unused-vars */
  client.send(msg, 0, msg.length, port, host, function (err, bytes) {
    if(err) {
      throw err
    }

    client.close()
  })
  /* eslint-enable no-unused-vars */
}

module.exports = Transport
