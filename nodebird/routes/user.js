const express = require('express');
const { User } = require('../models');
const router = express.Router();
const {isLoggedIn} = require('./middlewares');

router.post('/:id/follow', isLoggedIn, async (req,res,next)=> {
  try{
    const user = await User.findOne({where: {id: req.user.id}});
    // a.addB:a에 following관계 생성
    await user.addFollowing(parseInt(req.params.id, 10))
    res.send('sucess');
  }catch(error){
    console.error(error);
    next(error);
  }
});

router.post('/:id/unfollow', isLoggedIn, async (req,res,next)=> {
  try{
    const user = await User.findOne({where: {id: req.user.id}});
    // a.removeB:a에 B관계 삭제
    await user.removeFollowing(parseInt(req.params.id, 10))
    res.send('sucess');
  }catch(error){
    console.error(error);
    next(error);
  }
});

module.exports = router;