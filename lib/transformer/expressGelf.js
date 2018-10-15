'use strict';

const _ = require('lodash');

const standardKeys = ['pid', 'hostname', 'name', 'level', 'time', 'msg', 'v'];

function filterStandardKeys (data) {
  return Object
    .keys(data)
    .filter(function (key) { return !standardKeys.includes(key); });
}

module.exports = function (data) {
  const expressKeys = filterStandardKeys(data);
  const expressGelf = _.pick(data, expressKeys);

  if(_.has(expressGelf, 'req') && _.has(expressGelf.req, 'headers')) {
    expressGelf.req.headers = JSON.stringify(expressGelf.req.headers);
  }

  if(_.has(expressGelf, 'res') && _.has(expressGelf.res, 'header')) {
    expressGelf.res.header = JSON.stringify(expressGelf.res.header);
  }

  return expressGelf;
};
