const sequelize = require("sequelize");

module.exports = ((sequelize, DataTypes) => (
  sequelize.define('user',{
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    nick: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    password: {
      type: DataTypes.String(100),
      allowNull: true // 카카오로그인시 비밀번호 필요없음
    },
    provider:{ // local || kakao
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'local',
    },
    snsId: {
      type: DataTypes.STRING(30),
      allowNull: true,
    }
  },{
    timestamps: true, // 시퀄라이즈가 row생성일, 수정일 등록해줌
    paranoid: true, // 삭제일 기록 -> 복구가능
  })
))