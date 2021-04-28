const { Good, Auction, User, sequelize } = require('./models');

// 서버 시작될때 어제날짜 이전 물품중 낙찰되지 않은 상품 낙찰자 정하는 작업
module.exports = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const targets = await Good.findAll({
      where: {
        soldId: null},
    });
    targets.forEach(async (target) => {
      const end = new Date(target.createdAt);
      end.setHours(end.getHours() + target.end);
      if (new Date() > end){
        const success = await Auction.find({
          where: { goodId: target.id },
          order: [['bid', 'DESC']],
        });
        await Good.update({ soldId: success.userId }, { where: { id: target.id } });
        await User.update({
          money: sequelize.literal(`money - ${success.bid}`),
        }, {
          where: { id: success.userId },
        });
      }

    });
  } catch (error) {
    console.error(error);
  }
};