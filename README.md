# Koa mongo bucket

Koa mongo GridFS bucket instance

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
  .use(multer({dest: 'tmp'}).single('file'))
  .use(async(ctx, next) => {
    // Upload
    if(ctx.method == 'POST') {
      let file = await ctx.mongo.bucket.upload(ctx.req.file.path, ctx.req.file.originalname);
      fs.unlink(ctx.req.file.path, err => {});

      return ctx.redirect(`?id=${file._id}`);
    }

    // Select file
    if(!ctx.query.id) {
      return ctx.body = '<form method="post" enctype="multipart/form-data"><input type="file" name="file" /><button type="submit">Submit</button></form>';
    }

    // Rander image or download file
    let file = await ctx.mongo.collection('fs.files').findOne({_id: mongo.ObjectId(ctx.query.id)});

    ctx.etag = file.md5;
    ctx.lastModified = file.uploadDate;
    ctx.status = 200;
    if(ctx.fresh) {
      return ctx.status = 304;
    }

    ctx.type = file.filename;
    (ctx.query.download || !/^image\/.*$/.test(ctx.type)) && ctx.attachment(file.filename);

    ctx.body = await ctx.mongo.bucket.stream(file._id);
  })
  // ...
  ;
```

## License

MIT - [xiewulong](https://github.com/xiewulong)
