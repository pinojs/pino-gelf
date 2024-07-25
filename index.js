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
  .addOption(new program.Option('-h, --host [host]', 'Graylog Host').env('PINO_GELF_HOST'))
  .addOption(new program.Option('-p, --port [port]', 'Graylog Port').env('PINO_GELF_PORT').argParser(parseInt))
  .addOption(new program.Option('-P, --protocol [protocol]', 'Graylog protocol (UDP, HTTP, HTTPS, TCP, TLS)').env('PINO_GELF_PROTOCOL'))
  .addOption(new program.Option('-m, --max-chunk-size [maxChunkSize]', 'Graylog UDP Input Maximum Chunk Size').env('PINO_GELF_MAX_CHUNK_SIZE').argParser(parseInt))
  .addOption(new program.Option('-k, --keep-alive [keepAlive]', 'HTTP/TCP keep alive').env('PINO_GELF_KEEP_ALIVE'))
  .addOption(new program.Option('-r, --reconnection-limit [reconnectionLimit]', 'TCP reconnection limit').env('PINO_GELF_RECONNECTION_LIMIT').argParser(parseInt))
  .addOption(new program.Option('-d, --reconnection-delay [reconnectionDelay]', 'TCP reconnection delay').env('PINO_GELF_RECONNECTION_DELAY').argParser(parseInt))
  .addOption(new program.Option('-v, --verbose', 'Output GELF to console'))
  .addOption(new program.Option('-t, --passthrough', 'Output original input to stdout to allow command chaining'))
  .action(function () {
    const options = this.opts();

    const opts = {
      customKeys: options.specifyCustomFields || [],
      host: options.host || '127.0.0.1',
      protocol: (options.protocol && options.protocol.toLowerCase()) || 'udp',
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
