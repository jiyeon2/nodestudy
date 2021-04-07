const SocketIO = require('socket.io');


module.exports = (server) => {
  const io = SocketIO(server, {path: '/socket.io'});

  io.on('connection', (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip); // socket.io에서 socket.id로 클라이언트 구분가능

    socket.on('disconnect', () => {
      console.log('클라이언트 접속 해제', ip, socket.id);
      clearInterval(socket.interval);
    });
    socket.on('error', (error) => {
      console.error(error);
    });
    socket.on('reply', (data) => {
      console.log(data);
    });
    socket.on('message', (data) => {
      console.log(data);
    });
    socket.interval = setInterval(() => {
      socket.emit('news', 'Hello socket.io'); //메시지 이벤트를 키, 값 형태로 구분하여 보냄
    }, 3000);
  })
}

/**
 * socket.IO는 처음에 http 요청을 보낸다 -> 웹소켓 지원여부 확인
 */

// ws
// module.exports = (server) => {
//   const wss = new WebSocket.Server({server});

//   wss.on('connection', (ws, req) => {
//     // res 객체의 경우, 연결된 후 지속적으로 응답이 가므로 따로 없다
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     // req.headers['x-forwarded-for']: 프록시 거치기 전 아이피
//     // req.connection.remoteAddress : 최종 아이피
//     console.log('클라이언트 접속', ip);
//     ws.on('message', (message) => {
//       console.log(message);
//     });
//     ws.on('error', (error) => {
//       console.error(error);
//     });
//     ws.on('close', () => {
//       console.log('클라이언트 접속 해제',ip)
//       clearInterval(ws.interval); // 메모리 누수 막기위해 연결 끊길 때 clearInterval 해준다
//     });
    
//     const interval = setInterval(() => {
//       if (ws.readyState === ws.OPEN){ // 양방향 연결이 수립되었을 때 메시지 보내야 오류 안남
//         // ws.CONNECTING 연결중, ws.CLOSING 종료중, ws.CLOSED 종료 등이 있다
//         ws.send('서버에서 클라이언트로 메시지를 보냅니다');
//       }
//     }, 3000);
//     ws.interval = interval;
//   })
// }