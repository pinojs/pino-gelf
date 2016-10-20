'use strict'

var gelf = require('./gelf')()
var parse = require('fast-json-parse')
var pump = require('pump')
var split = require('split2')

pump(process.stdin, split(parse), gelf)
process.on('SIGINT', function () { process.exit(0) })
