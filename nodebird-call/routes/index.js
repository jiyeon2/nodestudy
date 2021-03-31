const express = require('express');
const axios = require('axios');
const router = express.Router();

// nodebird-call ->>> nodebird-api
// client-secret키를 nodebird-api로 보내고 인증받은 후 jwt토큰을 받아옴
// 매번 토큰을 받아오는것은 비효율적이므로
// 한번 토큰 받으면 유효기간 전까지는 세션에 토큰 저장할 예정
router.get('/test',(req,res,next) => {
  try{
    // 세션에 저장된 토큰이 없는 경우 토큰을 발급받는다
    if (!req.session.jwt){
      const tokenResult = await axios.post('http://localhost:8002/v1/token',{
        clientSecret: process.env.CLIENT_SECRET
      });
      if (tokenResult.data && tokenResult.data.code === 200){
        req.session.jwt = tokenResult.data.token;
      } else {
        // 토큰발급 실패한경우 - nodebird-api에서 에러코드와 메시지 담긴 객체 리턴한다
        return res.json(tokenResult.data);
      }
    }
    // 세션에 저장된 토큰을 요청헤더의 authorization에 넣어서 보낸다
    const result = await axios.get('http://localhost:8002/v1/test',{
      headers: { authorization: req.session.jwt}
    })
    return res.json(result.data);
  }catch(error){
    console.error(error);
    if (error.response.status === 419){
      return res.json(error.response.data);
    }
    return next(error);
  }
});

module.exports = router;