const express = require('express');
const jwt = require('jsonwebtoken');

const {verifyToken} = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.post('/token', async (req,res) => {
  const {clientSecret} = req.body;
  try{
    const domain = await Domain.findOne({
      where: {clientSecret},
      include: {
        model: User,
        attribute: ['nick','id'],
      },
    });
    if (!domain){
      // api서버의 응답 형식은 하나로 통일해주는 게 좋다
      // (catch error문에서도 next(error)로 넘기지 않고json으로 통일하여 보내고 있다)
      // 에러코드를 고유하게 지정하여 에러가 뭔지 쉽게 알 수 있도록 하자
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요'
      })
    }
    // 내 서버에서 발급한 키가 있다면 토큰발급
    const token = jwt.sign({
      id: domain.user.id,
      nick: domain.user.nick,
    }, process.env.JWT_SECRET,{
      expiresIn: '1m',
      issuer: 'nodebird'
    });
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    })
  }catch(error){
    return res.status(500).json({
      code: 500,
      message: '서버에러'
    })
  }
})

router.get('/test', verifyToken, (req,res) => {
  // verifyToken에서 req.decoded에 토큰 넣어줌
  res.json(req.decoded);
})

module.exports = router;