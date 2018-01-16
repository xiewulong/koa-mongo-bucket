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

app
  .use(mongo({uri: process.env.APP_MONGO}))
  .use(mongo_bucket())
  .use(multer({dest: 'tmp'}).single('file'))
  .use(async (ctx, next) => {
    if(ctx.method != 'POST') {
      return ctx.body = '<form method="post" enctype="multipart/form-data"><input type="test" value="test" /><input type="file" name="file" /><button type="submit">Submit</button></form>';
    }

    ctx.body = await ctx.mongo.bucket.upload(ctx.req.file.path, ctx.req.file.originalname);
    fs.unlink(ctx.req.file.path, err => {});
  })
  .use(async (ctx) => {
    ctx.status = 404;

    let text = 'Page Not Found';
    switch(ctx.accepts('html', 'json')) {
      case 'html':
        ctx.type = 'html';
        ctx.body = `<p>${text}</p>`;
        break;
      case 'json':
        ctx.body = {message: text};
        break;
      default:
        ctx.type = 'text';
        ctx.body = text;
    }
  })
  ;

!module.parent && app.listen(3000);
