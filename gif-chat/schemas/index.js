const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV} = process.env;

const MONGO_URL = `mongodb+srv://${MONGO_ID}:${MONGO_PASSWORD}@cluster0.tybva.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


module.exports = () => {
  const connect = () => {
    mongoose.connect(MONGO_URL, {
      dbName: 'gifchat',
    }, (error) => {
      if (error) {
        console.log('몽고디비 연결 에러', error);
      } else {
        console.log('몽고디비 연결 성공');
      }
    })
  };
  connect();

  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러',error);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다');
    connect();
  })

  require('./chat');
  require('./room');
}