// 사용자에게 발급할 시크릿키와 도메인주소를 저장할 Domain모델
module.exports = (sequelize, DataTypes) => (
  sequelize.define('domain', {
    host:{
      type: DataTypes.STRING(80),
      allowNull: false
    },
    type:{
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    clientSecret: { // 서버에서 쓸 시크릿키
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    frontSecret: { // 프론트에서 쓸 시크릿키
      type: DataTypes.STRING(40),
      allowNull: false,
    },
  },{
    timestamps: true,
    paranoid: true, //삭제일 기록
    validate: {
      unknownType() {
        if (this.type !== 'free' && this.type !== 'premium'){
          throw new Error('type 컬럼은 free이거나 premium이어야 합니다');
        }
      }
    }
  })
)