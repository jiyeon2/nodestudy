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