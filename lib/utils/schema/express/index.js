module.exports = {
  title: 'GELF Schema',
  type: 'object',
  properties: {
    req: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        method: { type: 'string' },
        url: { type: 'string' },
        headers: { type: 'string'},
        remoteAddress: { type: 'string' },
        remotePort: { type: 'integer' }
      }
    },
    res: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer' },
        header: { type: 'string' }
      }
    },
    responseTime: { type: 'integer' }
  }
}
