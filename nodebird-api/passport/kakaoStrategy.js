const kakaoStrategy = require('passport-kakao').Strategy;

const {User} = require('../models');

// (1) /auth/kakao로 요청
// (2). 카카오 로그인 - kakaoStrategy
// (3). /auth/kakao/callback으로 프로필 반환(응답내용 :accessToken, refreshToken, profile)
// (4). 받아온 정보로 (acessToken, refreshToken, pforile, done) => {} 이부분 함수 실행
// (2),(4)
module.exports = (passport) => {
  passport.use(new kakaoStrategy({
    clientID: process.env.KAKAO_ID, // 카카오 앱 아이디
    callbackURL: '/auth/kakao/callback', // 카카오 리다이렉트 주소
  }, async (acessToken, refreshToken, profile, done) => {
    // 로그인은 카카오가 대신 처리하지만, 우리 서비스 디비에도 사용자 저장
    try{
      const exUser = await User.findOne({
        where: {
          snsId: profile.id,
          provider: 'kakao'
        }
      });
      if (exUser){
        done(null, exUser); // req.user에 exUser가 저장됨
      } else {
        console.log(profile);
        const newUser = await User.create({
          email: profile._json && profile._json.kakao_account.email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao'
        });
        done(null, newUser);
      }
    }catch(error){
      console.error(error);
      done(error)
    }
    
  }))
}