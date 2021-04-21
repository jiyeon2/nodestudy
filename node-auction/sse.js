const SSE = require('sse');

module.exports = (server) => {
  const sse = new SSE(server);
  sse.on('connection', (client) => { // EventSource ServerSentEvents 서버시간을 받는다
    setInterval(() => {
      client.send(new Date().valueOf().toString());
    }, 1000);
  })
}