- mysql + sequelize : 데이터간에 관계(게시글 - 해시태그, 사람-팔로우, 사람-게시글)가 많아서 관계형데이터베이스 사용
- 예전강의라서 sequelize@4로 진행함

```
sequelize init
```
- sequelize init 후 config/config.json에서 데이터베이스 설정
```
sequelize db:create
```