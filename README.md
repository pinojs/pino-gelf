# Pino GELF
[![npm version](https://img.shields.io/npm/v/pino-gelf)](https://www.npmjs.com/package/pino-gelf)
[![Build Status](https://img.shields.io/github/workflow/status/pinojs/pino-gelf/CI)](https://github.com/pinojs/pino-gelf/actions)

Pino GELF (pino-gelf) is a transport for the [Pino](https://www.npmjs.com/package/pino) logger. Pino GELF receives Pino logs from stdin and transforms them into [GELF](http://docs.graylog.org/en/2.1/pages/gelf.html) format before sending them to a remote [Graylog](https://www.graylog.org) server via UDP.

### Contents

* [Installation](##Installation)
* [Usage](##Usage)
* [Example I/O](##Example)
* [GELF](##GELF)
* [Log Level Mapping](##LogLevelMapping)
* [Acknowledgements](##Acknowledgements)

## Installation

Pino GELF should be installed globally so it can be used as a utility:

```
npm i -g pino-gelf
```

## Usage

The recommended pipeline to run Pino GELF as a transform for Pino logs is as follows:

```
node your-app.js | pino-gelf log
```

The host, port and maximum chunk size of your Graylog server can be specified using options. Fields logged by [express-pino-middleware](https://github.com/pinojs/express-pino-logger) or any other custom fields included with Pino requests will be converted into strings (if they aren't already) and their keys will be prefixed with an underscore, according to the GELF spec. Also, you can choose to enable verbose mode which outputs all GELF messages locally, this can be useful for initial configuration. 

Finally, you can enable passthrough mode which will output the original input back to stdout. That enables you to make `pino-gelf` part of a chain of commands and use the original input for further processing (for example `pino-pretty`).

```
// Set Graylog host
node your-app.js | pino-gelf log -h graylog.server.com

// Set Graylog port
node your-app.js | pino-gelf log -p 12202

// Use HTTP protocol
node your-app.js | pino-gelf log -P http

// Use HTTPS protocol
node your-app.js | pino-gelf log -P https

// Use keep alive for HTTP/TCP
node your-app.js | pino-gelf log -P http -k true

// Use TCP protocol
node your-app.js | pino-gelf log -P tcp

// Use TLS protocol
node your-app.js | pino-gelf log -P tls

// Retry TCP connection for 10 times every 3 seconds
node your-app.js | pino-gelf log -P tcp -r 10 -d 3000

// Set Graylog maximum chunk size
node your-app.js | pino-gelf log -m 8192

// Enable local output
node your-app.js | pino-gelf log -v

// Enable passthrough mode
node your-app.js | pino-gelf log -t
```

__Note__: The defaults for these options are:

Property|Default
---|---
Host|`127.0.0.1`
Port|`12201`
Protocol|`udp`
Maximum Chunk Size|`1420`
Keep Alive|`true`
Reconnection limit|`-1 (no limit)`
Reconnection delay|`1000`
Verbose Logging|`false`
Passthrough|`false`


## Example

Given the Pino log message (formatted as JSON for readability):
```
{
  "pid":16699,
  "hostname":"han",
  "name":"pino-gelf-test-app",
  "level":30,
  "time":1481840140708,
  "msg":"request completed",
  "res":{
    "statusCode":304,
    "header":"HTTP/1.1 304 Not Modified\r\nX-Powered-By: Express\r\nETag: W/\"d-bNNVbesNpUvKBgtMOUeYOQ\"\r\nDate: Thu, 15 Dec 2016 22:15:40 GMT\r\nConnection: keep-alive\r\n\r\n"
  },
  "responseTime":8,
  "environment":"dev",
  "colour":"black",
  "req":{
    "id":1,
    "method":"GET",
    "url":"/",
    "headers":{
      "host":"localhost:3000",
      "connection":"keep-alive",
      "if-none-match":"W/\"d-bNNVbesNpUvKBgtMOUeYOQ\"",
      "upgrade-insecure-requests":"1",
      "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14",
      "accept-language":"en-gb",
      "dnt":"1",
      "accept-encoding":"gzip, deflate"
    },
    "remoteAddress":"::1",
    "remotePort":52829
  },
  "v":1
}
```

And the usage:
```
node server.js | pino-gelf log
```

Pino GELF will send the following message to your Graylog server (formatted here as JSON for readability):
```
Formatted JSON Data
{  
  "version":"1.1",
  "host":"han",
  "short_message":"request completed",
  "full_message":"request completed",
  "timestamp":1481840140.708,
  "level":6,
  "_name":"pino-gelf-test-app",
  "_res":"{\"statusCode\":304,\"header\":\"HTTP/1.1 304 Not Modified\\r\\nX-Powered-By: Express\\r\\nETag: W/\\\"d-bNNVbesNpUvKBgtMOUeYOQ\\\"\\r\\nDate: Thu, 15 Dec 2016 22:15:40 GMT\\r\\nConnection: keep-alive\\r\\n\\r\\n\"}",
  "_responseTime":"8",
  "_environment":"dev",
  "_colour":"black",
  "_req":"{\"id\":1,\"method\":\"GET\",\"url\":\"/\",\"headers\":{\"host\":\"localhost:3000\",\"connection\":\"keep-alive\",\"if-none-match\":\"W/\\\"d-bNNVbesNpUvKBgtMOUeYOQ\\\"\",\"upgrade-insecure-requests\":\"1\",\"accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14\",\"accept-language\":\"en-gb\",\"dnt\":\"1\",\"accept-encoding\":\"gzip, deflate\"},\"remoteAddress\":\"::1\",\"remotePort\":52829}"
}
```

## GELF

At present the mapping from standard Pino log messages to GELF messages is as follows:

GELF Property|Pino Log Property|Notes
---|---|---
version|-|Hardcoded to 1.1 per GELF docs
host|hostname|-
short_message|msg|msg is truncated to 64 characters
full_message|msg|msg is not truncated
timestamp|time|-
level|level|Pino level is mapped to SysLog levels<sup>[1](#LogLevelMapping)</sup>

## Log Level Mapping

The mapping from Pino log levels to SysLog levels used by GELF are as follows:

Pino Log Level|SysLog Level
---|---
Trace|Debug
Debug|Debug
Info|Info
Warn|Warning
Error|Error
Fatal|Critical

__Note:__ Pino log messages without a level map to SysLog Critical

## Acknowledgements

The implementation of Pino GELF is based in large part on [pino-syslog](https://github.com/jsumners/pino-syslog/) and [gelf-node](https://github.com/robertkowalski/gelf-node).


