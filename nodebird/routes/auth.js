const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {User} = require('../models');

const {isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();
// POST /auth/join
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const {email, nick, password} = req.body;
  try{
    const exUser = await User.findOne({where: {email}});
    if (exUser){
      req.flash('joinError','이미 가입된 회원입니다');
      return res.redirect('/join');
    }
    console.time('암호화시간');
    const hash = await bcrypt.hash(password, 12); // 숫자가 클수록 암호화하는데 오래 걸림. 1초정도 걸리게 하면 적당하다고 함
    console.timeEnd('암호화시간');

    await User.create({
      email,
      nick,
      password: hash
    });
    return res.redirect('/');
  }catch(error){
    console.error(error);
    next(error);
  }
})

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => { // req.body.email, req.body.password가 들어옴
  passport.authenticate('local', (authError, user, info) => { // localStrategy에서 done(error, success, fail)로 넘긴 인자가 콜백의 인자로 들어옴
    if (authError){
      console.error(authError);
      return next(authError); // 에러 있으면 에러처리 핸들러로 넘김
    }
    if (!user){
      //사용자 정보가 없으면 실패한거임
      req.flash('loginError', info.message);
      return res.redirect('/');
    }
    //성공인 경우 passport가 req에 login붙여줌
    return req.login(user, (loginError) => { // req.login(user) 하면 세션에 사용자정보가 저장됨 - 이때 passport.serializeUser가 실행됨, req.user로 사용자 정보 접근가능 
      if(loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    })
  })(req, res, next);
});

// GET /auth/logout
router.get('/logout', isLoggedIn, (req,res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
})

// GET /auth/kakao 
// (1)kakao strategy실행
router.get('/kakao', passport.authenticate('kakao'));

// (2)
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/' // 실패시 메인으로
}), (req, res) => { // 성공시
  res.redirect('/');
});

module.exports = router;