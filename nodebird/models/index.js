
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

let sequelize = new Sequelize(
  config.database, config.username, config.password, config);


db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

//일대다 관계
db.User.hasMany(db.Post); // 1: hasMany
db.Post.belongsTo(db.User); // N : belongsTo

//다대다 관계
// through: 관계테이블 명
db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'});
db.Hashtag.belongsToMany(db.Post, {through: 'PostHashtag'});
// PostHashtag 테이블
// 글1 - 해시태그1
// 글1 - 해시태그2
// 글2 - 해시태그1
// 글2 - 해시태그3

// 유저 팔로잉도 다대다관계
// as: 매칭 모델명, foreignKey: 상대테이블 아이디
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'followingId'});
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Following', foreignKey: 'followerId'});

// 게시글 좋아요 => 다대다관계
// 한사람이 여러 게시글 좋아요 누를 수 있다
// 하나의 게시글은 여러 사람의 좋아요 받을 수 있다
db.User.belongsToMany(db.Post, {through: 'Like'});
db.Post.belongsToMany(db.User, {through: 'Like'});

module.exports = db;
