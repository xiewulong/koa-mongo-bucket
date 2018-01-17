/*!
 * Koa mongo bucket
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2018/01/16
 * since: 0.0.1
 */
'use strict';

const fs = require('fs');
const mongodb = require('mongodb');
const uuidv4 = require('uuid/v4');

class Bucket {

  constructor(mongo) {
    if(!mongo) {
      throw 'Koa mongo is required';
    }

    this.bucket = new mongodb.GridFSBucket(mongo);
    mongo.bucket = this;
  }

  /**
   * Upload
   *
   * @param {string} file_path
   * @param {object} [fs_create_read_stream_options]
   * @param {string} [filename=uuidv4]
   * @param {object} [bucket_open_upload_stream_options]
   * @return {promise}
   */
  upload(file_path, fs_create_read_stream_options, filename, bucket_open_upload_stream_options) {
    if(!file_path) {
      throw 'File\'s upload path is required';
    }
    if(typeof fs_create_read_stream_options == 'string') {
      bucket_open_upload_stream_options = filename;
      filename = fs_create_read_stream_options;
      fs_create_read_stream_options = undefined;
    }
    if(!filename) {
      filename = uuidv4().replace(/-/g, '');
    }
    return new Promise((resolve, reject) => {
      fs
        .createReadStream(file_path, fs_create_read_stream_options)
        .pipe(this.bucket.openUploadStream(filename, bucket_open_upload_stream_options))
        .on('finish', resolve)
        .on('error', reject)
        ;
    });
  }

  /**
   * Download
   *
   * @param {string} id
   * @param {object} [bucket_open_download_stream_options]
   * @param {string} file_path
   * @param {object} [fs_create_write_stream_options]
   * @return {promise}
   */
  download(id, bucket_open_download_stream_options, file_path, fs_create_write_stream_options) {
    if(!id) {
      throw 'File id is required';
    }
    if(typeof bucket_open_download_stream_options == 'string') {
      fs_create_write_stream_options = file_path;
      file_path = bucket_open_download_stream_options;
      bucket_open_download_stream_options = undefined;
    }
    if(!file_path) {
      throw 'File\'s download path is required';
    }

    return new Promise((resolve, reject) => {
      this
        .stream(id, bucket_open_download_stream_options)
        .pipe(fs.createWriteStream(file_path, fs_create_write_stream_options))
        .on('finish', resolve)
        .on('error', reject)
        ;
    });
  }

  /**
   * Stream
   *
   * @param {string} id
   * @param {object} [bucket_open_download_stream_options]
   * @return {stream}
   */
  stream(id, bucket_open_download_stream_options) {
    return this.bucket.openDownloadStream(mongodb.ObjectId(id), bucket_open_download_stream_options);
  }

}

module.exports = () => {
  return async (ctx, next) => {
    new Bucket(ctx.mongo);
    await next();
  };
};
