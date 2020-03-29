const cp = require('child_process');
const path = require('path');

jest.mock('dgram');

const pgPath = path.join(__dirname, '..', 'index.js');

function pinoOutput(msg, level) {
    return `{"level":${level},"time":1531171074631,"msg":"${msg}","pid":657,"hostname":"box","name":"app","v":1}`;
}

async function testPinoToSyslogLevel(pinoLevel, syslogLevel, testCallback) {    
    const pg = cp.spawn('node', [pgPath, 'log', '-v']);
    const expected = `{"_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":${syslogLevel}}\n`;

    pg.stdout.on('data', data => {
        pg.kill();
        expect(data.toString()).toEqual(expected);
        testCallback();
    });
    
    pg.stdin.write(pinoOutput('hello world', pinoLevel) + '\n');
}

describe('pinoGelf', function() {
    test('no logs are processed when non-json message is passed to stdin', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        
        pg.stdout.on('data', () => {
            expect(true).toEqual(false);
            done();
        });
        
        pg.on('close', (code) => {
            expect(code).toEqual(0);
            done();
        });
        
        pg.stdin.end('this is not json\n');
    });

    test('pino output is transformed to gelf output', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6}\n';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 30) + '\n');
    });

    test('short message is trimmed down', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const msg = 'hello world world world world world world world world world world world world';
        const expected = `{"_name":"app","version":"1.1","host":"box","short_message":"hello world world world world world world world world world world","full_message":"${msg}","timestamp":1531171074.631,"level":6}\n`;
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput(msg, 30) + '\n');
    });

    test('pino trace level is transformed to syslog debug level', async (done) => {
        testPinoToSyslogLevel(10, 7, done); // trace -> debug
    })

    test('pino debug level is transformed to syslog debug level', done => {
        testPinoToSyslogLevel(20, 7, done); // debug -> debug
    })

    test('pino warn level is transformed to syslog warning level', done => {
        testPinoToSyslogLevel(40, 4, done); // warn  -> warn
    })

    test('pino error level is transformed to syslog error level', done => {
        testPinoToSyslogLevel(50, 3, done); // error -> error
    })

    test('pino fatal level is transformed to syslog critical level', done => {
        testPinoToSyslogLevel(60, 2, done); // fatal -> critical
    })

    test('pino output with express-pino-middleware content is transformed to gelf output', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const pinoExpressOutput = '{"level":30,"time":1531171074631,"msg":"hello world","res":{"statusCode":304,"header":"HTTP/1.1 304 Not Modified"},"responseTime":8,"req":{"method":"GET","url":"/","headers":{"accept":"text/html"}},"pid":657,"hostname":"box","name":"app","v":1}'
        const expected = '{"_res":"{\\"statusCode\\":304,\\"header\\":\\"HTTP/1.1 304 Not Modified\\"}","_responseTime":"8","_req":"{\\"method\\":\\"GET\\",\\"url\\":\\"/\\",\\"headers\\":{\\"accept\\":\\"text/html\\"}}","_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6}\n';
        
        pg.stdout.on('data', data => {
            pg.kill();
            expect(data.toString()).toEqual(expected);
            done();
        });
        
        pg.stdin.write(pinoExpressOutput + '\n');
    });

    test('pino output with custom fields is transformed to gelf output', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","environment":"dev","colour":"red","pid":657,"hostname":"box","name":"app","v":1}';
        const expected = '{"_environment":"dev","_colour":"red","_name":"app","version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6}\n';
        
        pg.stdout.on('data', data => {
            pg.kill();
            expect(data.toString()).toEqual(expected);
            done();
        });
        
        pg.stdin.write(pinoCustomOutput + '\n');
    });

    test('pino output is passed through to stdout when using --passthrough arg', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-t']);
        const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","environment":"dev","colour":"red","pid":657,"hostname":"box","name":"app","v":1}';
        
        pg.stdout.on('data', data => {
            pg.kill();
            expect(data.toString()).toEqual(pinoCustomOutput + '\n');
            done();
        });
        
        pg.stdin.write(pinoCustomOutput + '\n');
    });
})
