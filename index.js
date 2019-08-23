#! /usr/bin/env node

'use strict';

const program = require('commander');
const version = require('./package.json').version;
const pinoGelf = require('./lib/pino-gelf');

program
  .version(version);

program
  .command('log')
  .description('Run Pino-GELF')
  .option('-h, --host [host]', 'Graylog Host')
  .option('-p, --port [port]', 'Graylog Port', parseInt)
  .option('-m, --max-chunk-size [maxChunkSize]', 'Graylog Input Maximum Chunk Size', parseInt)
  .option('-v, --verbose', 'Output GELF to console')
  .option('-t, --passthrough', 'Output original input to stdout to allow command chaining')
  .action(function () {
    const opts = {
      customKeys: this.specifyCustomFields || [],
      host: this.host || '127.0.0.1',
      maxChunkSize: this.maxChunkSize || 1420,
      port: this.port || 12201,
      verbose: (this.verbose && !this.passthrough) || false,
      passthrough: this.passthrough || false
    };

    pinoGelf(opts);
  });

program
  .parse(process.argv);
