const local = require('./localStrategy');
const {User} = requrie('../models');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  })
  passport.deserializeUser((id, done) => {
    User.find({where: {id}})
    .then(user => done(null,user))
    .catch(error => done(error))

    // user.id로 유저정보 조회해서
    // req.user에 넣어준다 - 라우터에서 req.user 사용가능해짐
  });

  local(passport);
}