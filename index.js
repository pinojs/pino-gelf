#!/usr/bin/env node
'use strict'

const gelf = require('./lib/gelf')
const parse = require('fast-json-parse')
const pump = require('pump')
const split = require('split2')

pump(process.stdin, split2(parse), gelf.transform)
process.on('SIGINT', function () { process.exit(0) })
