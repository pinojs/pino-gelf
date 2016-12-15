module.exports = {
  title: 'GELF Schema',
  type: 'object',
  properties: {
    version: { type: 'string' },
    host: { type: 'string' },
    short_message: { type: 'string' },
    full_message: { type: 'string' },
    timestamp: { type: 'integer' },
    level: { type: 'integer' },
    facility: { type: 'string' }
  }
}
