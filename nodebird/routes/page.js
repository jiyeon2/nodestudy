const express = require('express');
const { Post, User } = require('../models');
const router = express.Router();
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

//프로필 페이지 - profile.pug 렌더링
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', {title: '내정보 - nodebird', user: null});
});

//회원가입페이지
router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {
    title: '회원가입 - nodebird',
    user: req.user,
    joinError: req.flash('joinError')
  })
});

//메인페이지
router.get('/', (req, res, next) => {
  Post.findAll({
    include: {
      model: User,
      attributes: ['id','nick'],
    }
  }).then(posts => {
    res.render('main',{
      title: 'Nodebird',
      twits: posts,
      user: req.user,
      loginError: req.flash('login error')
    })
  }).catch(error => {
    console.error(error);
    next(error);
  }) 


});

module.exports = router;