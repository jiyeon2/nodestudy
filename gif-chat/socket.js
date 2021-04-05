const webSocket = require('ws');

module.exports = (server) => {
  const wss = new WebSocket.Server({server});

  wss.on('connection', (ws, req) => {
    // res 객체의 경우, 연결된 후 지속적으로 응답이 가므로 따로 없다
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // req.headers['x-forwarded-for']: 프록시 거치기 전 아이피
    // req.connection.remoteAddress : 최종 아이피
    console.log('클라이언트 접속', ip);
    ws.on('message', (message) => {
      console.log(message);
    });
    ws.on('error', (error) => {
      console.error(error);
    });
    ws.on('close', () => {
      console.log('클라이언트 접속 해제',ip)
    });
  })
}