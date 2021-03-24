const express = require('express');
const router = express.Router();

//프로필 페이지 - profile.pug 렌더링
router.get('/profile', (req, res) => {
  res.render('profile', {title: '내정보 - nodebird', user: null});
});

//회원가입페이지
router.get('/join', (req, res) => {
  res.render('join', {
    title: '회원가입 - nodebird',
    user: null,
    joinError: req.flash('joinError')
  })
});

//메인페이지
router.get('/', (req, res, next) => {
  res.render('main',{
    title: 'Nodebird',
    twits: [],
    user: null,
    loginError: req.flash('login error')
  })

});

module.exports = router;