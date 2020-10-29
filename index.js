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
  .option('-P, --protocol [protocol]', 'Graylog protocol (UDP, HTTP, HTTPS, TCP, TLS)')
  .option('-m, --max-chunk-size [maxChunkSize]', 'Graylog UDP Input Maximum Chunk Size', parseInt)
  .option('-k, --keep-alive [keepAlive]', 'HTTP/TCP keep alive')
  .option('-r, --reconnection-limit [reconnectionLimit]', 'TCP reconnection limit', parseInt)
  .option('-d, --reconnection-delay [reconnectionDelay]', 'TCP reconnection delay', parseInt)
  .option('-v, --verbose', 'Output GELF to console')
  .option('-t, --passthrough', 'Output original input to stdout to allow command chaining')
  .action(function () {
    const options = this.opts();

    const opts = {
      customKeys: options.specifyCustomFields || [],
      host: options.host || '127.0.0.1',
      protocol: options.protocol || 'udp',
      maxChunkSize: options.maxChunkSize || 1420,
      keepAlive: options.keepAlive != null ? options.keepAlive.toLowerCase() !== 'false' : true,
      reconnectionLimit: options.reconnectionLimit || -1,
      reconnectionDelay: options.reconnectionDelay || 1000,
      port: options.port || 12201,
      verbose: (options.verbose && !options.passthrough) || false,
      passthrough: options.passthrough || false
    };

    switch(opts.protocol) {
    case 'udp':
    case 'http':
    case 'https':
    case 'tcp':
    case 'tls':
      break;
    default:
      throw new Error('Unsupported protocol ' + opts.protocol);
    } 

    pinoGelf(opts);
  });

program
  .parse(process.argv);
