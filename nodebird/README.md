- mysql + sequelize : 데이터간에 관계(게시글 - 해시태그, 사람-팔로우, 사람-게시글)가 많아서 관계형데이터베이스 사용
- 예전강의라서 sequelize@4로 진행함

```
sequelize init
```
- sequelize init 후 config/config.json에서 데이터베이스 설정
```
sequelize db:create
```

- <form enctype="multipart/form-data"> : 이미지 업로드시
    - bodyparser, express.json, express.urlencoded가 해석을 못함
    - multipart/form-data 해석을 위해 multer 필요


- CORS 에러 (cross origin resource sharing)
    - 서버에서 서버로 요청하는건 에러 발생하지 않지만 프론트에서 다른 ORIGIN의 서버로 요청하면 CORS에러 발생함
    - 프론트에서 같은 오리진의 서버에 요청한 후, 서버에서 다른 오리진의 서버로 요청하면 에러 발생 안함
    - 같은 도메인에 서버를 둬서 그 서버에서 다른 서버로 요청(프록시 요청)하거나
    - 다른 오리진의 서버에서 응답헤더에 뭔가 심어주면 해결가능