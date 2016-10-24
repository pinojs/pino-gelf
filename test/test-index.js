'use strict'

var chai = require('chai')
var path = require('path')
var should = chai.should()
var spawn = require('child_process').spawn
var zlib = require('zlib')

var messages = require('./messages')
var utils = require('../lib/utils')

var pinoGelfPath = path.join(path.resolve(__dirname, '..', 'index'))

describe('pino-gelf', function () {
  it('should not write anything to the standard out when passed no data', function () {
    var expected = ''

    var psut = spawn('node', [pinoGelfPath])
    psut.stdout.on('data', function (data) {
      data.should.be.equal(expected)
      psut.kill()
      done()
    })

    psut.stdin.write('\n')
  })

  it('should write a well formed GELF object to the standard out when passed a valid Pino Message with message length less than or equal to 64 characters', function (done) {
    var expected = utils.stringify({
      version: '1.1',
      host: 'findmypast.co.uk',
      short_message: 'hello world',
      full_message: 'hello world',
      timestamp: 1459529098958,
      level: 6,
      facility: 'blah'
    })

    var psut = spawn('node', [pinoGelfPath])
    psut.stdout.on('data', function (data) {
      data.toString('utf8').should.be.equal(expected)
      psut.kill()
      done()
    })

    psut.stdin.write(messages.helloWorld + '\n')
  })

  it('should write a well formed GELF object to the standard out when passed a valid Pino Message with message length greater than 64 characters', function (done) {
    var expected = utils.stringify({
      version: '1.1',
      host: 'findmypast.co.uk',
      short_message: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam',
      full_message: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at',
      timestamp: 1459529098958,
      level: 6,
      facility: 'blah'
    })

    var psut = spawn('node', [pinoGelfPath])
    psut.stdout.on('data', function (data) {
      data.toString('utf8').should.be.equal(expected)
      psut.kill()
      done()
    })

    psut.stdin.write(messages.stupidLong + '\n')
  })
})
