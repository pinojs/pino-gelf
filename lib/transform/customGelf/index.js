'use strict'

const _ = require('lodash')

function filterPid (key) { return key !== 'pid' }
function filterHostname (key) { return key !== 'hostname' }
function filterName (key) { return key !== 'name' }
function filterLevel (key) { return key !== 'level' }
function filterTime (key) { return key !== 'time' }
function filterMsg (key) { return key !== 'msg' }
function filterPinoVersion (key) { return key !== 'v' }

function buildCustomKeys (data) {
  return Object
    .keys(data)
    .filter(filterPid)
    .filter(filterHostname)
    .filter(filterName)
    .filter(filterLevel)
    .filter(filterTime)
    .filter(filterMsg)
    .filter(filterPinoVersion)
}

module.exports = function (data) {
  const customKeys = buildCustomKeys(data)
  return _.pick(data, customKeys)
}
