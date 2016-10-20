# Pino GELF

Pino GELF (pino-gelf) is a 'transport' for the [Pino](https://www.npmjs.com/package/pino) logger. Pino GELF receives Pino logs from stdin and transforms them into [GELF](http://docs.graylog.org/en/2.1/pages/gelf.html) format before gzipping them ready for transport to a remote [Graylog](https://www.graylog.org) server.

The business of transportation is not handled by this package, [pino-socket](https://www.npmjs.com/package/pino-socket) is recommended to handle the sending of the gzipped output as it can handle both TCP and UDP.

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
node your-app.js | pino-gelf | pino-socket -a graylog.server.url
```

## Example

Given the Pino log message:

```
{"pid":94473,"hostname":"findmypast.co.uk","name":"app","level":30,"msg":"hello world","time":1459529098958,"v":1}
```

Pino GELF will output a gzip containing:

```
{"version":"1.1","host":"findmypast.co.uk","short_message":"hello world","full_message":"hello world","timestamp":1459529098958,"level":6,"_facility":"app"}
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

The implementation of Pino GELF is based in large part on [pino-syslog](https://github.com/jsumners/pino-syslog/) which maps Pino log messages to the syslog format.
