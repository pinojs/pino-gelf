'use strict'

const options = {
  host: '127.0.0.1',
  maxChunkSize: 1420,
  port: 12201
}

const longOpts = {
  host: String,
  maxChunkSize: Number,
  port: Number
}

const shortOpts = {
  h: '--host',
  m: '--max-chunk-size',
  p: '--port'
}

module.exports = {
  options: options,
  longOpts: longOpts,
  shortOpts: shortOpts
}
