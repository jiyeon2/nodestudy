const express = require('express');
const multer = require('multer');
const path = require('path');
const { Post, Hashtag } = require('../models');
const router = express.Router();

// 업로드 객체
const upload = multer({
  storage: multer.diskStorage({ // 서버 디스크에 이미지 저장함, 외부스토리지에 저장도 가능
    destination(req, file, cb) {
      cb(null, 'uploads/'); // 파일저장경로
    },
    filename(req, file, cb){
      const ext = path.extname(file.originalname); // 파일의 확장자 가져옴
      cb(null, path.filename(file.originalname, ext) + new Date().valueOf()+ext);//파일명 중복 막기위해 시간도 붙임
    }
  }),
  limit: {fileSize: 5 * 1024 * 1024}, // 파일사이즈(바이트)
})

router.post('/img', upload.single('img'), (req, res) => {
  console.log(req.file); // multer로 업로드 한것은 req.file에 저장되어 있다(보통 다른 값은 req.body에 들어간다)
  res.json({url: `img/${req.file.filename}`}); // 프론트로 저장된 파일의 경로를 보내준다
});// input의 name이나 id


const upload2 = multer();
// 사진 업로드 후 게시글 업로드시에는 
// 사진 대신 사진 주소를 올리므로 업로드객체.none
router.post('/', upload2.none(), async (req, res, next) => {
  try{
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);
    if (hashtags){
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where: {title: tag.slice(1).toLowerCase()},
      })));
      await post.addHashtags(result.map(r => r[0]));

    }
    res.redirect('/');
  }catch(error){
    console.error(error);
    next(error);
  }
});


module.exports = router;