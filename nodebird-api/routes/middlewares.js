const jwt = require('jsonwebtoken');

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