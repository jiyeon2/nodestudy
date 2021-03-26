const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// urlencoded 미들웨어가 해석한 req.body의 값들을
// usernameField, passwordField에 연결함
module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email', // req.body.email로 들어온 값을 usernameField로 사용하겠다
    passwordField: 'password', // req.body.password 로 들어온 값을 passwordField로 사용하겠다
  }, async (email, password, done) => { // done(error,success,fail)
    // done(error);// 서버에러시 
    // done(null, 사용자정보); // 성공시
    // done(null, false, 실패정보); // 실패시
    try {
      const exUser = await User.find({where: {email}});
      if(exUser){
        // 이메일 검사 후 유저가 존재하면 비밀번호 검사
        const result = await bcrypt.compare(password, exUser.password);
        if (result){
          // 비밀번호 일치, 성공 - 사용자정보 보냄
          done(null, exUser);
        } else {
          // 비밀번호 불일치, 실패정보 전달
          done(null, false, {message: '이메일-비밀번호 조합이 맞지 않습니다'}); // 보안을 위해 이메일이 있는지, 비밀번호가 틀렸는지 상세하게 알려주지 않음
        }
      } else {
        // 유저가 존재하지 않는경우 - 실패정보 전달
        done(null, false, {message:'이메일-비밀번호 조합이 맞지 않습니다'});
      }

    } catch(error) {
      console.error(error);
      done(error);
    }
  }));
}