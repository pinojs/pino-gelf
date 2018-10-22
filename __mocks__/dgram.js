const dgram = jest.genMockFromModule('dgram'); // eslint-disable-line

function createSocket() {
  return {
    send: () => {},
    close: () => {}
  };
}

dgram.createSocket = createSocket;

module.exports = dgram;