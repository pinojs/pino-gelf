'use strict';

const fastJsonParse = require('fast-json-parse');
const pipeline = require('./pipeline');
const pump = require('pump');
const split = require('split2');

module.exports = function (opts) {
  const pipe = pipeline(opts);
  pump(process.stdin, split(fastJsonParse), pipe);
  process.on('SIGINT', function () { process.exit(0); });
};
