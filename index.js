#! /usr/bin/env node

'use strict'

const program = require('commander')
const version = require('./package.json').version
const pinoGelf = require('./lib/pinoGelf')

function parseCustomFields (val) {
  if (val === undefined) return []
  if (val.includes(',')) return val.split(',')
  return [ val ]
}

program
  .version(version)

program
  .command('log')
  .description('Run Pino-GELF')
  .option('-h, --host [host]', 'Graylog Host')
  .option('-p, --port [port]', 'Graylog Port', parseInt)
  .option('-m, --max-chunk-size [maxChunkSize]', 'Graylog Input Maximum Chunk Size', parseInt)
  .option('-e, --use-express-middleware-preset')
  .option('-c, --specify-custom-fields [keyList]', 'Comma Separated List of Custom Keys', parseCustomFields)
  .option('-v, --verbose', 'Output GELF to console')
  .action(function () {
    const opts = {
      customKeys: this.specifyCustomFields || [],
      host: this.host || '127.0.0.1',
      maxChunkSize: this.maxChunkSize || 1420,
      port: this.port || 12201,
      useExpressMiddlewarePreset: this.useExpressMiddlewarePreset || false,
      verbose: this.verbose || false
    }

    pinoGelf(opts)
  })

program
  .parse(process.argv)
