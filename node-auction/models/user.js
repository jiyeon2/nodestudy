module.exports = (sequelize, DataTypes) => (
  sequelize.define('user', {
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    nick:{
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    password:{
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    money:{
      type: DataTypes.INTEGET,
      allowNull: false,
      defaultValue: 0,
    },
  },{
    timestamps: true, // 생성 수정시각 기록
    paranoid: true, // 삭제시각 기록
  })
);