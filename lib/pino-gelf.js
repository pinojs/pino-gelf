'use strict'

const nopt = require('nopt')
const opts = require('./opts')
const parse = require('fast-json-parse')
const pump = require('pump')
const split = require('split2')

const argv = nopt(opts.longOpts, opts.shortOpts, process.argv)
const options = Object.assign(opts.options, argv)
const pipeline = require('./pipeline')(options)

pump(process.stdin, split(parse), pipeline)
process.on('SIGINT', function () { process.exit(0) })
