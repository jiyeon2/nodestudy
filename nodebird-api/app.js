const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const v1 = require('./routes/v1');
const v2 = require('./routes/v2');
const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport); // passport.use(LocalStrategy); passport.use(kakaoStrategy); 등록


app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');
app.set('port', process.env.PORT || 8002);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false
  }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/v1', v1);
app.use('/v2', v2);
app.use('/auth', authRouter);
app.use('/', indexRouter);

// 404 미들웨어
app.use((req,res,next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
})

//에러처리 미들웨어
app.use((err,req,res) => {
  res.locals.messages = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err: {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'),'번 포트에서 대기중');
})