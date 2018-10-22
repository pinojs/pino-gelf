const cp = require('child_process');
const path = require('path');

jest.mock('dgram');

const pgPath = path.join(__dirname, '..', 'index.js');

function pinoOutput(msg, level) {
    return `{"level":${level},"time":1531171074631,"msg":"${msg}","pid":657,"hostname":"box","name":"app","v":1}`;
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
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app"}';
        
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
        const expected = `{"version":"1.1","host":"box","short_message":"hello world world world world world world world world world world","full_message":"${msg}","timestamp":1531171074.631,"level":6,"facility":"app"}`;
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput(msg, 30) + '\n');
    });

    test('pino trace level is transformed to syslog debug level', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":7,"facility":"app"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 10) + '\n');
    });

    test('pino debug level is transformed to syslog debug level', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":7,"facility":"app"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 20) + '\n');
    });

    test('pino warn level is transformed to syslog warning level', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":4,"facility":"app"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 40) + '\n');
    });

    test('pino error level is transformed to syslog error level', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":3,"facility":"app"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 50) + '\n');
    });

    test('pino fatal level is transformed to syslog critical level', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":2,"facility":"app"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 60) + '\n');
    });

    test('unspecified level is transformed to syslog critical level', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-v']);
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":2,"facility":"app"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoOutput('hello world', 60) + '\n');
    });

    test('pino output with express-pino-middleware option is transformed to gelf output', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-e', '-v']);
        const pinoExpressOutput = '{"level":30,"time":1531171074631,"msg":"hello world","res":{"statusCode":304,"header":"HTTP/1.1 304 Not Modified"},"responseTime":8,"req":{"method":"GET","url":"/","headers":{"accept":"text/html"}},"pid":657,"hostname":"box","name":"app","v":1}'
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","req":{"method":"GET","url":"/","headers":"{\\"accept\\":\\"text/html\\"}"},"res":{"statusCode":304,"header":"\\"HTTP/1.1 304 Not Modified\\""},"responseTime":8}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoExpressOutput + '\n');
    });

    test('pino output with custom fields is transformed to gelf output', done => {
        const pg = cp.spawn('node', [pgPath, 'log', '-c', 'environment,colour', '-v']);
        const pinoCustomOutput = '{"level":30,"time":1531171074631,"msg":"hello world","environment":"dev","colour":"red","pid":657,"hostname":"box","name":"app","v":1}';
        const expected = '{"version":"1.1","host":"box","short_message":"hello world","full_message":"hello world","timestamp":1531171074.631,"level":6,"facility":"app","environment":"dev","colour":"red"}';
        
        pg.stdout.on('data', data => {
            expect(data.toString()).toEqual(expected);
            pg.kill();
            done();
        });
        
        pg.stdin.write(pinoCustomOutput + '\n');
    });
})