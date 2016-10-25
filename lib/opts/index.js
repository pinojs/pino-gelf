var options = {
  host: '127.0.0.1',
  maxChunkSize: 1420,
  port: 12201
}

var longOpts = {
  host: String,
  maxChunkSize: Number,
  port: Number
}

var shortOpts = {
  h: '--host',
  m: '--max-chunk-size',
  p: '--port'
}

module.exports = {
  options: options,
  longOpts: longOpts,
  shortOpts: shortOpts
}
