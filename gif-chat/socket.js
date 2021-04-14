const SocketIO = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cookie = require('cookie-signature');
require('dotenv').config();

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, {path: '/socket.io'});
  app.set('io',io); // 익스프레스 변수 저장 방법
  // 라우터에서  req.app.get('io')로 socketIo 꺼내와서
  // req.app.get('io').of('/room').emit(...) 으로 메시지 보낼 수 있다

// 네임스페이스
// 실시간 데이터가 전달될 주소를 구별할 수 있다
// 기본값은 '/'
const room = io.of('/room');
const chat = io.of('/chat');
// 익스프레스 미들웨어를 소켓IO에서 쓰는 방법
io.use((socket, next) => { 
  cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next) 
});
io.use((socket, next) => { // 소켓에서도 미들웨어 사용할 수 있다, req,res대신 웹소켓 받고, 소켓안의 req,res 를 넘긴다
  sessionMiddleware(socket.request, socket.request.res, next);
})

room.on('connection', (socket) => {
  console.log('room 네임스페이스에 접속');
  socket.on('disconnection', () => {
    console.log('room네임스페이스 접속 해제');
  })
})

chat.on('connection', (socket) => {
  console.log('chat네임스페이스에 접속');
  const req = socket.request;
  const {headers: {referer}} = req;
  const roomId = referer
  .split('/')[referer.split('/').length -1]
  .replace(/\?.+/, '');
  // req.headers.referer 은 이렇게 들어옴(방의 주소) -> /room/qkdwpahr

  socket.join(roomId); // 방에 접속하는 코드

  // socket.to(roomId).emit('join',{ // 해당 방id에만 메시지 보냄
  //   user:'system',
  //   chat: `${req.session.color}님이 입장하셨습니다`,
  //   number: socket.adapter.rooms[roomId].length
  // });
  // 입장 퇴장 시스템 메시지 디비에 저장 - 디비 접속하는 건 http 요청으로 라우터 거치는 게 좋다
  axios.post(`http://localhost:8005/room/${roomId}/sys`, {
    type: 'join'
  },{
    headers: {
      Cookie: `connect.sid=${'s%A' + cookie.sign(req.signedCookies['connect.sid'])}`
    }
  });

  socket.on('disconnect', () => {
    console.log('chat 네임스페이스 접속 해제');
    socket.leave(roomId); // 방 나가기
    // 방의 인원이 하나도 없으면 방 없앰
    // 여기서 방 없애도 되지만 디비를 조작해야 하는 경우 
    // axios로 요청한거처럼 라우터 통해서(http 요청해서) 조작하는 게나음(여기서 하면 코드 매우 지저분해짐)
    const currentRoom = socket.adapter.rooms[roomId]; // 방 정보와 인원 들어있음
    const userCount = currentRoom ? currentRoom.length : 0;
    if (userCount === 0){
      axios.delete(`http://localhost:8005/room/${roomId}`)
      .then(() => {
        console.log('방 제거 요청 성공')
      }).catch(error => console.error(error));
    } else {
      // socket.to(roomId).emit('exit', {
      //   user: 'system',
      //   chat: `${req.session.color}님이 퇴장하셨습니다`,
      //   number: socket.adapter.rooms[roomId].length
      // });
      axios.post(`http://localhost:8005/room/${roomId}/sys`, {
        type: 'exit'
      },{
        headers: {
          Cookie: `connect.sid=${'s%A' + cookie.sign(req.signedCookies['connect.sid'])}`
        }
      });
    }
  })
})

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