/*!
 * App
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2018/01/16
 * since: 0.0.1
 */
'use strict';

const fs = require('fs');
const Koa = require('koa');
const mongo = require('koa-mongo');
const multer = require('koa-multer');
const mongo_bucket = require('../');

const app = module.exports = new Koa();
const development = app.env === 'development';
const production = app.env === 'production';

app .use(mongo({ uri: process.env.APP_MONGO }))
    .use(mongo_bucket())
    .use(multer({ dest: 'tmp' }).single('file'))
    .use(async (ctx, next) => {
      // Upload
      if (ctx.method == 'POST') {
        let file = await ctx.mongo.bucket.upload(ctx.req.file.path, ctx.req.file.originalname);
        fs.unlink(ctx.req.file.path, err => {});

        return ctx.redirect(`?id=${file._id}`);
      }

      // Select file
      if (!ctx.query.id) {
        return ctx.body = '<form method="post" enctype="multipart/form-data"><input type="file" name="file" /><button type="submit">Submit</button></form>';
      }

      // Rander image or download file
      let file = await ctx.mongo.db().collection('fs.files').findOne({ _id: mongo.ObjectId(ctx.query.id) });

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
    .use(async (ctx) => {
      ctx.status = 404;

      let message = 'Page Not Found';
      switch (ctx.accepts('html', 'json')) {
        case 'html':
          ctx.type = 'html';
          ctx.body = `<p>${message}</p>`;
          break;
        case 'json':
          ctx.body = { message };
          break;
        default:
          ctx.type = 'text';
          ctx.body = message;
      }
    })
    ;

!module.parent && app.listen(3000);
