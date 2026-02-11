'use strict'

const test = require('node:test')
const assert = require('node:assert')
const cp = require('node:child_process')
const path = require('node:path')

const pgPath = path.join(__dirname, '..', 'index.js')

function pinoOutput (msg, level) {
  return `{"level":${level},"time":1531171074631,"msg":"${msg}","pid":657,"hostname":"box","name":"app","v":1}`
}

function deepEqual (found, expected) {
  const _found = JSON.parse(found)
  const _expected = JSON.parse(expected)
  assert.deepStrictEqual(_found, _expected)
}

function testPinoToSyslogLevel (pinoLevel, syslogLevel, testCallback) {
  const pg = cp.spawn('node', [pgPath, 'log', '-v'])
  const expected = `{"_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074,"level":${syslogLevel}}\n`

  pg.stdout.on('data', data => {
    pg.kill()
    deepEqual(data.toString(), expected)
    testCallback()
  })

  pg.stdin.write(pinoOutput('hello world', pinoLevel) + '\n')
}

test('UDP protocol is used with appropriate param', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '-P', 'udp'])

  pg.on('close', (code) => {
    assert.equal(code, 0)
    done()
  })

  pg.stdin.end(pinoOutput('hello world', 30) + '\n')
})

test('HTTP protocol is used with appropriate param', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '-P', 'http'])

  pg.on('close', (code) => {
    assert.equal(code, 0)
    done()
  })

  pg.stdin.end(pinoOutput('hello world', 30) + '\n')
})

test('HTTPS protocol is used with appropriate param', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '-P', 'https'])

  pg.on('close', (code) => {
    assert.equal(code, 0)
    done()
  })

  pg.stdin.end(pinoOutput('hello world', 30) + '\n')
})

test('TCP protocol is used with appropriate param', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '-P', 'tcp'])

  pg.on('close', (code) => {
    assert.equal(code, 0)
    done()
  })

  // As the TCP socket hangs, and we cannot mock it in the child process
  // let's assume that if no error has been raised in 3 seconds
  // everything went fine
  setTimeout(() => {
    pg.kill('SIGINT')
  }, 3000)

  pg.stdin.end(pinoOutput('hello world', 30) + '\n')
})

test('TLS protocol is used with appropriate param', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '-P', 'tls'])

  pg.on('close', (code) => {
    assert.equal(code, 0)
    done()
  })

  // As the TCP socket hangs, and we cannot mock it in the child process
  // let's assume that if no error has been raised in 3 seconds
  // everything went fine
  setTimeout(() => {
    pg.kill('SIGINT')
  }, 3000)

  pg.stdin.end(pinoOutput('hello world', 30) + '\n')
})

test('an error is returned when an unknown protocol is specified', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '-P', 'foo'])

  pg.on('close', (code) => {
    assert.equal(code, 1)
    done()
  })

  pg.stdin.end(pinoOutput('hello world', 30) + '\n')
})

test('no logs are processed when non-json message is passed to stdin', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v'])

  pg.stdout.on('data', () => {
    assert.ok(true)
    done()
  })

  pg.on('close', (code) => {
    assert.equal(code, 0)
    done()
  })

  pg.stdin.end('this is not json\n')
})

test('pino output is transformed to gelf output', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v'])
  const expected = '{"_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074,"level":6}\n'

  pg.stdout.on('data', data => {
    deepEqual(data.toString(), expected)
    pg.kill()
    done()
  })

  pg.stdin.write(pinoOutput('hello world', 30) + '\n')
})

test('short message is trimmed down', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v'])
  const msg = 'hello world world world world world world world world world world world world'
  const expected = `{"_name":"app","version":"1.1","host":"box","short_message":"hello world world world world world world world world world world","full_message":"${msg}","timestamp":1531171074,"level":6}\n`

  pg.stdout.on('data', data => {
    deepEqual(data.toString(), expected)
    pg.kill()
    done()
  })

  pg.stdin.write(pinoOutput(msg, 30) + '\n')
})

test('pino trace level is transformed to syslog debug level', (t, done) => {
  testPinoToSyslogLevel(10, 7, done) // trace -> debug
})

test('pino debug level is transformed to syslog debug level', (t, done) => {
  testPinoToSyslogLevel(20, 7, done) // debug -> debug
})

test('pino warn level is transformed to syslog warning level', (t, done) => {
  testPinoToSyslogLevel(40, 4, done) // warn  -> warn
})

test('pino error level is transformed to syslog error level', (t, done) => {
  testPinoToSyslogLevel(50, 3, done) // error -> error
})

test('pino fatal level is transformed to syslog critical level', (t, done) => {
  testPinoToSyslogLevel(60, 2, done) // fatal -> critical
})

test('pino output with express-pino-middleware content is transformed to gelf output', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v'])
  const pinoExpressOutput = '{"level":30,"time":1531171074631,"msg":"hello world","res":{"statusCode":304,"header":"HTTP/1.1 304 Not Modified"},"responseTime":8,"req":{"method":"GET","url":"/","headers":{"accept":"text/html"}},"pid":657,"hostname":"box","name":"app","v":1}'
  const expected = '{"_res":"{\\"statusCode\\":304,\\"header\\":\\"HTTP/1.1 304 Not Modified\\"}","_responseTime":"8","_req":"{\\"method\\":\\"GET\\",\\"url\\":\\"/\\",\\"headers\\":{\\"accept\\":\\"text/html\\"}}","_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074,"level":6}\n'

  pg.stdout.on('data', data => {
    pg.kill()
    deepEqual(data.toString(), expected)
    done()
  })

  pg.stdin.write(pinoExpressOutput + '\n')
})

test('pino output with custom fields is transformed to gelf output', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v'])
  const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","environment":"dev","colour":"red","pid":657,"hostname":"box","name":"app","v":1}'
  const expected = '{"_environment":"dev","_colour":"red","_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074,"level":6}\n'

  pg.stdout.on('data', data => {
    pg.kill()
    deepEqual(data.toString(), expected)
    done()
  })

  pg.stdin.write(pinoCustomOutput + '\n')
})

test('custom messageKey is used when --message-key is specified', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-v', '--message-key', 'message'])
  const input = '{"level":30,"time":1531171074631,"message":"hello world","pid":657,"hostname":"box","name":"app","v":1}'
  const expected = '{"_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074,"level":6}\n'

  pg.stdout.on('data', data => {
    pg.kill()
    deepEqual(data.toString(), expected)
    done()
  })

  pg.stdin.write(input + '\n')
})

test('pino output is passed through to stdout when using --passthrough arg', (t, done) => {
  const pg = cp.spawn('node', [pgPath, 'log', '-t'])
  const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","environment":"dev","colour":"red","pid":657,"hostname":"box","name":"app","v":1}'

  pg.stdout.on('data', data => {
    pg.kill()
    assert.equal(data.toString(), pinoCustomOutput + '\n')
    done()
  })

  pg.stdin.write(pinoCustomOutput + '\n')
})
