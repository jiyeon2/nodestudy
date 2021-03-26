const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

require('dotenv').config();

const indexRouter = require('./routes/page');
const authRouter = require('./routes/auth');
// const userRouter = require('./routes/user');
const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport); // passport.use(LocalStrategy); passport.use(kakaoStrategy); 등록

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  }
}));
app.use(flash());
app.use(passport.initialize()); // passport 설정 초기화 미들웨어
app.use(passport.session()); // 로그인시 사용자정보를 세션에 저장 - exporess-session미들웨어보다 아래에 위치해야 한다

app.use('/', indexRouter);
app.use('/auth', authRouter);

// 404처리 미들웨어
app.use((req,res,next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//error 매개변수 들어있는 에러처리 미들웨어
app.use((err,req,res) => {
  res.locals.message = err.message;
  res.locals.error =req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
})

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 서버 실행중입니다`);
})