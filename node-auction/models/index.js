const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.pasword, config,
)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Good = require('./good')(sequelize, Sequelize);
db.Auction = require('./auction')(sequelize, Sequelize);

db.User.hasMany(db.Auction);
db.Auction.belongsTo(db.User);
db.Good.hasMany(db.Auction);
db.Auction.belongsTo(db.Good);
db.User.hasMany(db.Good);
db.Good.belongsTo(db.User, { as : 'owner'});
db.User.hasMany(db.Good);
db.Good.belongsTo(db.User, { as : 'sold'});

module.exports = db;
