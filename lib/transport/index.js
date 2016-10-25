var crypto = require('crypto')
var defaults = require('./opts')
var deflate = require('zlib').deflate
var dgram = require('dgram')
var EventEmitter = require('events').EventEmitter

var Transport = function(opts) {
  /* eslint-disable no-unused-vars */
  var config = Object.assign({}, defaults, opts)
  /* eslint-enable no-unused-vars */

  this.on('log', function (msg) {
    this.compress(msg, function (buf) {
      this.processMessage(buf)
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
  var length = chunks.length
  var gelfBytes = [ 0x1e, 0x0f ]
  var datagrams = []

  var createDatagramArray = function (msgId) {
    for(var i = 0; i < length; i++) {
      datagrams[i] = new Buffer(gelfBytes.concat(msgId, i, length, chunks[i]))
    }
    cb && cb(null, datagrams)
  }

  var randomBytesCallback = function (err, buf) {
    if(err) {
      throw err
    }

    createDatagramArray(Array.prototype.slice.call(buf))
  }

  var getRandomBytes = function () {
    crypto.randomBytes(8, randomBytesCallback)
  }

  getRandomBytes()
}

Transport.prototype.prepareMultipleChunks = function (buf, chunkSize) {
  var chunkArray = []

  for(var i = 0; i < buf.length; i += chunkSize) {
    chunkArray.push(Array.prototype.slice.call(buf, i, i + chunkSize))
  }

  return chunkArray
}

Transport.prototype.process = function (buf) {
  var config = this.config
  var chunkSize = buf.length

  if(config.connection === 'wan' && chunkSize > config.maxChunkSizeWan) {
    this.processMultipleChunks(buf, config.maxChunkSizeWan)
  } else if(config.connection === 'lan' && chunkSize > config.maxChunkSizeLan) {
    this.processMultipleChunks(buf, config.maxChunkSizeLan)
  } else {
    process.nextTick(function () {
      this.send(buf)
    })
  }
}

Transport.prototype.processMultipleChunks = function (buf, chunkSize) {
  var chunkArray = this.prepareMultipleChunks(buf, chunkSize)

  this.prepareDatagrams(chunkArray, function (err, datagrams) {
    process.nextTick(function () {
      this.sendMultipleMessages(datagrams)
    })
  })
}

Transport.prototype.send = function (msg) {
  var client = dgram.createSocket('udp4')
  var port = this.config.port
  var host = this.config.host

  /* eslint-disable no-unused-vars */
  client.send(msg, 0, msg.length, port, host, function (err, bytes) {
    if(err) {
      throw err
    }

    client.close()
  })
  /* eslint-enable no-unused-vars */
}

Transport.prototype.sendMultipleMessages = function (datagrams) {
  for(var i = 0; i < datagrams.length; i++) {
    this.sendMessage(datagrams[i])
  }
}

module.exports = Transport
