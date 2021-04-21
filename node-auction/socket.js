module.exports = (server, app) => {
  const io = require('socket.io')(server,{path:'/socket.io'});

  app.set('io',io);

  io.on('connection', (socket) => {
    const req = socket.request;
    const {headers:{referer}} = req;
    // req.cookies, req.session접근 불가, 접근하려면 io.use 미들에ㅜ어 연결해야함
    const roomId = referer.split('/')[referer.split('/').length -1];
    socket.join(roomId);
    socket.on('disconnect', () => {
      socket.leave(roomId);
    })
  })

}