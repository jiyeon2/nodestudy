const jwt = require('jsonwebtoken');
const RateLimit = require('express-rate-limit');

exports.isLoggedIn = (req,res,next) => {
  // passport가 req.login, req.logout, req.isAuthenticated 추가해줌
  if (req.isAuthenticated()){ // 로그인여부 알려줌
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req,res,next) => {
  if (!req.isAuthenticated()){
    next();
  } else {
    res.redirect('/');
  }
}

exports.verifyToken = (req,res,next) => {
  try{
    // jwt.verify(토큰, jwt시크릿);
    // jwt시크릿이 노출되면 내서버에서 만들어낸 키인척 할 수 있으므로 노출되면 안됨
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  }catch(error){
    if (error.name === 'TokenExpiredError'){
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다'
      });
    }
    return res.status(401).json({
      code: 401,
      message: '유효하지 않은 토큰입니다'
    });

  }
}

exports.apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1분 동안 60 * 1000ms
  max: 1, // 최대 요청 가능 횟수
  delayMs: 0, // 요청간 간격
  handler(req,res){ // 기준 시간 내 최대요청가능 횟수 넘겼을 경우 응답
    res.status(this.statusCode).json({
      code: this.statusCode, // 429 - http 코드 아니고 임의로 지정한거라서 api사용자에게 인식시키는게 필요하다
      message: '무료 사용자는 1분에 한번만 요청할 수 있습니다'
    })
  }
})

exports.premiumApiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 1분 동안 60 * 1000ms
  max: 1000, // 최대 요청 가능 횟수
  delayMs: 0, // 요청간 간격
  handler(req,res){ // 기준 시간 내 최대요청가능 횟수 넘겼을 경우 응답
    res.status(this.statusCode).json({
      code: this.statusCode, // 429 - http 코드 아니고 임의로 지정한거라서 api사용자에게 인식시키는게 필요하다
      message: '유료 사용자는 1분에 1000번만 요청할 수 있습니다'
    })
  }
})

exports.deprecated = (req,res) => {
  res.status(410).json({
    code: 410,
    message: '새로운 버전이 나왔습니다. 새로운 버전의 API를 사용해주세요'
  })
}