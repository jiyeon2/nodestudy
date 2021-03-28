const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

// const user = {};
// deserializeUser는 모든 요청에 실행되므로 DB조회를 캐싱해서 효율적으로 만들어야 한다
// 실무에서는 DB요청 회수를 줄이는 게 좋다, redis나 memchache?사용 이게뭐지

module.exports = (passport) => {
  // serializeUser는 로그인할 때 한번만 호출됨
  // 로그인 성공 후 세션에 사용자 정보 저장되고 serializeUser실행됨
  // 유저정보가 {id: 1, name: zero, age:22} 이면
  // 식별자인 ID만 저장
  passport.serializeUser((user, done) => {
    done(null, user.id);
  })

  // 로그인 후 페이지 요청마다 passport.session()이 실행됨
  // 여기서 deserializeUser실행됨
  // 메모리에 저장된 id를 가져와 디비에서 정보를 찾음 이 정보를 req.user에 넣어줌
  passport.deserializeUser((id, done) => {
    // if (user[id]) {
    //   done(user[id]);
    // } else {
      User.findOne({
        where: {id},
        include: [{
          model: User, // req.user에 팔로잉 관계 추가
          attributes: ['id','nick'],
          as: 'Followers', // /model/user에서 belongsToMany as 로 넣었던 부분 가져옴
        },{
          model: User,
          attributes: ['id','nick'],
          as: 'Followings',
        }]
      })
      .then(user => {
        // user[id] = user; 
        done(null, user)})
      .catch(err => done(err));
    // }
  })

  local(passport);
  kakao(passport);
}