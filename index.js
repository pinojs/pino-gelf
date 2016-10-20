#!/usr/bin/env node
'use strict'

var path = require('path')
var fs = require('fs')
var realPath = fs.realpathSync(__dirname)
var script = path.join(realPath, 'lib', 'pino-gelf.js')

require(script.toString())
