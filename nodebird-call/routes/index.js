const express = require('express');
const axios = require('axios');
const router = express.Router();

const version =  'v2'

// nodebird-call ->>> nodebird-api
// client-secret키를 nodebird-api로 보내고 인증받은 후 jwt토큰을 받아옴
// 매번 토큰을 받아오는것은 비효율적이므로
// 한번 토큰 받으면 유효기간 전까지는 세션에 토큰 저장할 예정
router.get('/test', async (req,res,next) => {
  try{
    // 세션에 저장된 토큰이 없는 경우 토큰을 발급받는다
    if (!req.session.jwt){
      const tokenResult = await axios.post(`http://localhost:8002/${version}/token`,{
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
    const result = await axios.get(`http://localhost:8002/${version}/test`,{
      headers: { authorization: req.session.jwt}
    })
    return res.json(result.data);
  }catch(error){
    console.error(error);
    if (error.response.status === 419){ // 토큰만료 에러
      // http 상태코드에 없는거 마음대로 정의해서 써도됨
      return res.json(error.response.data);
    }
    return next(error);
  }
});

// 세션에 토큰이 없으면 토큰 발급받아서 저장한 후 api요청하는 함수
const request = async (req, api) => {
  try{
    if (!req.session.jwt){
      const tokenResult = await axios.post(`http://localhost:8002/${version}/token`,{
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token;
    }
    return await axios.get(`http://localhost:8002/${version}${api}`,{
      headers: {authorization: req.session.jwt},
    }) 
  } catch(error) {
    console.error(error);
    if (error.response.status < 500){
      // 토큰 만료시 재발급하기
      // 세션에 저장된 만료된 토큰을 삭제하고 다시 요청보내면 됨
      delete req.session.jwt;
      request(req,api);
      return error.response;
    }
    throw error;
  }
}


// nodebird-call로 /mypost 요청 보내면
// nodebird-api /posts/my요청이 감(토큰과 함께)
router.get('/mypost', async (req,res,next) => {
  try{
    const result = await request(req, '/posts/my');
    res.json(result.data);
  }catch(error){
    console.error(error);
    next(error);
  }
});

// /search/node ---> nodebird-api /posts/hashtag/node 요청(&토큰)
router.get('/search/:hashtag', async (req,res,next) => {
  try{
    const result = await request(
      req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`, // 주소에 한글쓰면 에러나므로 encodeURIComponent 사용
    );
    res.json(result.data);
  }catch(error){
    console.error(error);
    next(error);
  }
})

router.get('/follow', async (req,res,next) => {
  try{
    const result = await request(
      req, '/follow'
    );
    res.json(result.data);
  }catch(error){
    console.error(error);
    next(error);
  }
});

router.get('/', (req, res) => {
  res.render('main', {key: process.env.FRONT_SECRET});
})

module.exports = router;