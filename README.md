# Koa 2 mongo bucket

Koa 2 mongo GridFS bucket instance

## 目录

<details>

* [安装](#install)
* [使用](#useage)
* [License](#license)

</details>

## Install

安装

```bash
$ npm i [-S] koa-mongo-bucket
```

## Useage

配置中间件

```js
const Koa = require('koa');
const mongo = require('koa-mongo');
const mongo_bucket = require('koa-mongo-bucket');

const app = new Koa();
app
  // ...
  .use(mongo())
  .use(mongo_bucket())
  // ...
  ;
```

上传文件

```js
const multer = require('koa-multer');

app
  // ...
  .use(multer({dest: 'tmp/uploads'}).single('file'))
  .use(async(ctx, next) => {
    if(ctx.method == 'POST') {
      return ctx.body = await ctx.mongo.bucket.upload(ctx.req.file.path, ctx.req.file.originalname);
    }

    ctx.body = '<form method="post" enctype="multipart/form-data"><input type="test" value="test" /><input type="file" name="file" /><button type="submit">Submit</button></form>';
  })
  // ...
  ;
```

## License

MIT - [xiewulong](https://github.com/xiewulong)
