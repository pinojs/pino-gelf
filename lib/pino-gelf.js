'use strict'

var transformAndTransport = require('./transform-transport')()
var parse = require('fast-json-parse')
var pump = require('pump')
var split = require('split2')

pump(process.stdin, split(parse), transformAndTransport)
process.on('SIGINT', function () { process.exit(0) })
