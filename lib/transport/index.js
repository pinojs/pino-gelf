var crypto = require('crypto')
var defaults = require('./opts')
var deflate = require('zlib').deflate
var dgram = require('dgram')
var EventEmitter = require('events').EventEmitter
var utils = require('../utils')

var Transport = function () {
  var self = this

  self.config = Object.assign({}, defaults)

  self.on('log', function (gelf) {
    var msg = utils.stringify(gelf)

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
  var datagrams = []
  var gelfBytes = [ 0x1e, 0x0f ]
  var length = chunks.length

  var createDatagramArray = function (msgId) {
    for(var i = 0; i < chunks.length; i++) {
      datagrams[i] = new Buffer(gelfBytes.concat(msgId, i, length, chunks[i]))
    }

    cb && cb(null, datagrams)
  }

  var randomBytesCallback = function (err, msgId) {
    if(err) {
      throw err
    }

    createDatagramArray(Array.prototype.slice.call(msgId))
  }

  var getRandomBytes = function () {
    crypto.randomBytes(8, randomBytesCallback)
  }

  getRandomBytes()
}

Transport.prototype.prepareMultipleChunks = function (msg, chunkSize) {
  var chunks = []

  for(var i = 0; i < msg.length; i += chunkSize) {
    chunks.push(Array.prototype.slice.call(msg, i, i + chunkSize))
  }

  return chunks
}

Transport.prototype.processMultipleChunks = function (msg, chunkSize) {
  var self = this

  var chunks = self.prepareMultipleChunks(msg, chunkSize)
  self.prepareDatagrams(chunks, function (err, datagrams) {
    process.nextTick(function () {
      self.sendMultipleMessages(datagrams)
    })
  })
}

Transport.prototype.processMessage = function (msg) {
  var self = this
  var maxChunkSize = self.config.maxChunkSize

  if(msg.length > maxChunkSize) {
    self.processMultipleChunks(msg, maxChunkSize)
  } else {
    process.nextTick(function () {
      self.sendMessage(msg)
    })
  }
}

Transport.prototype.sendMultipleMessages = function (datagrams) {
  var self = this

  for(var i = 0; i < datagrams.length; i++) {
    self.sendMessage(datagrams[i])
  }
}

Transport.prototype.sendMessage = function (msg) {
  var self = this
  var host = self.config.host
  var port = self.config.port
  var client = dgram.createSocket('udp4')

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
