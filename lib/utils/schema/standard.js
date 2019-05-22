module.exports = {
  title: 'GELF Schema',
  type: 'object',
  properties: {
    version: { type: 'string' },
    host: { type: 'string' },
    short_message: { type: 'string' },
    full_message: { type: 'string' },
    timestamp: { type: 'integer' },
    level: { type: 'integer' }
  },
  patternProperties: {
    // This is for all additional GELF fields which begin with an underscore
    // See http://docs.graylog.org/en/3.0/pages/gelf.html#gelf-payload-specification under `_[additional field]`
    '^_[\\w\\.\\-]*$': {
      type: 'string'
    }
  },
};
