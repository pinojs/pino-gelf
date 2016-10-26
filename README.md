# Pino GELF

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
node your-app.js | pino-gelf
```

The host, port and maximum chunk size of your Graylog server can be specified using options:

```
// Set Graylog host
node your-app.js | pino-gelf -h graylog.server.com

// Set Graylog port
node your-app.js | pino-gelf -p 12202

// Set Graylog maximum chunk size
node your-app.js | pino-gelf -m 8192
```

__Note__: The defaults for these options are:

Property|Default
---|---
Host|127.0.0.1
Port|12201
Maximum Chunk Size|1420

## Example

Given the Pino log message:

```
{"pid":94473,"hostname":"findmypast.co.uk","name":"app","level":30,"msg":"hello world","time":1459529098958,"v":1}
```

Pino GELF will send a message containing to your Graylog server:

```
{"version":"1.1","host":"findmypast.co.uk","short_message":"hello world","full_message":"hello world","timestamp":1459529098958,"level":6,"facility":"app"}
```

## GELF

At present the mapping from Pino log messages to GELF messages is as follows:

GELF Property|Pino Log Property|Notes
---|---|---
version|-|Hardcoded to 1.1 per GELF docs
host|hostname|-
short_message|msg|msg is truncated to 64 characters
full_message|msg|msg is not truncated
timestamp|time|-
level|level|Pino level is mapped to SysLog levels<sup>[1](#LogLevelMapping)</sup>
facility|name|-

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
