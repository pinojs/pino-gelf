'use strict'

var chai = require('chai')
var should = chai.should()

var syslogLevel = require('../../lib/utils/syslog')

var sut = require('../../lib/utils')

describe('lib/utils', function () {
  describe('pinoLevelToSyslogLevel', function () {
    it('should return SysLog Level Debug for Pino Level Trace', function () {
      var pinoLevelTrace = 10
      return sut.pinoLevelToSyslogLevel(pinoLevelTrace).should.be.equal(syslogLevel.debug)
    })

    it('should return SysLog Level Debug for Pino Level Debug', function () {
      var pinoLevelDebug = 20
      return sut.pinoLevelToSyslogLevel(pinoLevelDebug).should.be.equal(syslogLevel.debug)
    })

    it('should return SysLog Level Info for Pino Level Info', function () {
      var pinoLevelInfo = 30
      return sut.pinoLevelToSyslogLevel(pinoLevelInfo).should.be.equal(syslogLevel.info)
    })

    it('should return SysLog Level Warning for Pino Level Warn', function () {
      var pinoLevelWarn = 40
      return sut.pinoLevelToSyslogLevel(pinoLevelWarn).should.be.equal(syslogLevel.warning)
    })

    it('should return SysLog Level Error for Pino Level Error', function () {
      var pinoLevelError = 50
      return sut.pinoLevelToSyslogLevel(pinoLevelError).should.be.equal(syslogLevel.error)
    })

    it('should return SysLog Level Critical for Pino Level Fatal', function () {
      var pinoLevelCritical = 60
      return sut.pinoLevelToSyslogLevel(pinoLevelCritical).should.be.equal(syslogLevel.critical)
    })

    it('should return SysLog Level Critical for all other Pino Levels', function () {
      var pinoLevelOther = 0
      return sut.pinoLevelToSyslogLevel(pinoLevelOther).should.be.equal(syslogLevel.critical)
    })
  })
})
