'use strict'

var nopt = require('nopt')
var opts = require('./opts')
var parse = require('fast-json-parse')
var pump = require('pump')
var split = require('split2')

var argv = nopt(opts.longOpts, opts.shortOpts, process.argv)
var options = Object.assign(opts.options, argv)
var pipeline = require('./pipeline')(options)

pump(process.stdin, split(parse), pipeline)
process.on('SIGINT', function () { process.exit(0) })
