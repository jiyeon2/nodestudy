const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors')
const url = require('url');

const {apiLimiter, verifyToken, premiumApiLimiter} = require('./middlewares');
const {Domain, User, Post, Hashtag} = require('../models');
const router = express.Router();

// cors, apiLimiter 적용 등 급격한 변화가 있으면 api버전을 올리는 게 좋다
// api 서버는 버전관리가 중요하다
// router.use(cors()); // 응답에 ACCESS-CONTROL-ALLOW-ORIGIN헤더를 넣어줌
// cors() 에 도메인 지정하지 않으면 모든 도메인 요청을 허용함

// router.use(cors()) 아래 코드와 같음
// 미들웨어 안에 미들웨어 넣어서 커스터마이징 가능
router.use(async (req,res,next) => {
  const domain = await Domain.findOne({
    where: { host: url.parse(req.get('origin')).host },
  })
  if (domain){
    // 도메인이 등록되어있다면 cors허용
    cors({origin: req.get('origin')})(req,res,next);
  } else {
    next();
  }
})
router.use(async (req,res,next) => {
  const domain = await Domain.findOne({
    where: { host: url.parse(req.get('origin')).host },
  })
  if (domain.type === 'premium'){
    premiumApiLimiter(req,res,next);
  } else {
    apiLimiter(req,res,next);
  }
})

router.post('/token', async (req,res) => {
  const {clientSecret} = req.body;
  try{
    const domain = await Domain.findOne({
      where: { frontSecret : clientSecret}, // 도메인과 시크릿 모두 같아야 인증되므로 프론트 시크릿은 프론트에 노출되어도 됨
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

router.get('/test',apiLimiter, verifyToken, (req,res) => {
  // verifyToken에서 req.decoded에 토큰 넣어줌
  res.json(req.decoded);
})

router.get('/posts/my', verifyToken, (req,res) => {
  Post.findAll({ where: {userId: req.decoded.id }})
  .then((posts) => {
    console.log(posts);
    res.json({
      code: 200,
      payload: posts,
    })
  }).catch((error) => {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버에러',
    });
  })
});

// 응답은 json으로 통일한다
// 어떤 응답은 json이고, 어떤응답은 xml이고, html이고 그러면
// 사용자가 혼란스러움
router.get('/posts/hashtag/:title', verifyToken, async (req,res) => {
  try{
    const hashtag = await Hashtag.find({ where: {title: req.params.title}});
    if (!hashtag){
      return res.status(404).json({
        code: 404,
        message: '검색결과가 없습니다'
      })
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts
    })
  }catch(error){
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버에러'
    })
  }
})

router.get('/follow', verifyToken, async (req, res) => {
  try{
    // verifyToken에서 토큰 내용을 복호화하여 req.decoded에 넣어준다
    const user = await User.find({where: {id: req.decoded.id}});
    const follower = await user.getFollowers({attributes: ['id','nick']});
    const following = await user.getFollowings({attributes: ['id','nick']});
    return res.json({
      code: 200,
      follower,
      following
    })
  } catch(error){
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버에러'
    })
  }
});

module.exports = router;