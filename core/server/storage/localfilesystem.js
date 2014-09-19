// # Local File System Image Storage module
// The (default) module for storing images, using the local file system

var _         = require('lodash'),
    express   = require('express'),
    fs        = require('fs-extra'),
    nodefn    = require('when/node'),
    path      = require('path'),
    when      = require('when'),
    errors    = require('../errors'),
    config    = require('../config'),
    utils     = require('../utils'),
    baseStore = require('./base'),
    images    = require('images'),
     util     = require("util"),
    stream    = require('stream'),

    localFileStore;
var base = base || {};

// 文件拷贝
base.createFloder = function(path, callback) {
    var arr = path.split('/');
    var floderPath = '';
    var index = 0;
    (function() {
        var callFunc = arguments.callee;
        var self = this;
        floderPath = floderPath + arr[index] + '/';
        fs.readdir(floderPath, function(err, files) {
            if(err) {
                fs.mkdir(floderPath, 0777, function(err) {
                    console.log("[create floder] create floder " + floderPath);
                    if (++index < arr.length) {
                        callFunc.call(self);
                    } else {
                        callback? callback() : '';
                    }
                });
            } else {
                if (++index < arr.length) {
                    callFunc.call(self);
                } else {
                    callback? callback() : '';
                }
            }
        });
    })();
};

base.copyFile = function(fileInPath, fileOutPath, callback) {
    var fileOutFolderPath = fileOutPath.substr(0, fileOutPath.lastIndexOf('/'));
    base.createFloder(fileOutFolderPath, function() {
        console.log("[copy] copy " + fileInPath + " to " + fileOutPath);
        var is = fs.createReadStream(fileInPath);
        var os = fs.createWriteStream(fileOutPath);
        is.pipe(os, function(err){
            if(err) {
                console.log("[copy] copy err: " + err);
                return ;
            }
            callback? callback() : '';
        });
    });
};


localFileStore = _.extend(baseStore, {
    // ### Save
    // Saves the image to storage (the file system)
    // - image is the express image object
    // - returns a promise which ultimately returns the full url to the uploaded image
    'save': function (image) {
        var saved = when.defer(),
            targetDir = this.getTargetDir(config.paths.imagesPath),
            targetFilename,
            uploadPath,
            uploadFilename,
            targetThumb,
            targetUploadThumb,
            hasThumb = false;

        this.getUniqueFileName(this, image, targetDir).then(function (filename) {
            targetFilename = filename;
            uploadPath = config.cdn.syncImagesPath + targetDir.substr(targetDir.lastIndexOf('images') + 7);

            return nodefn.call(fs.mkdirs, targetDir);
        }).then(function () {
            uploadFilename = uploadPath + '/' + targetFilename.substr(targetFilename.lastIndexOf('/') + 1);

            return nodefn.call(fs.copy, image.path, targetFilename);
        }).then(function () {
            if (!config.images.dir) {
                return ;
            }

            var thumbDir,
                pos,
                thumbName;
            var uploadThumbDir;
            var imagesDir = '/' + config.images.dir + '/';

            thumbDir = targetDir + imagesDir;
            uploadThumbDir = uploadPath + imagesDir;
            pos = targetFilename.lastIndexOf('/') + 1;
            thumbName = targetFilename.substr(pos);

            if (-1 == pos) {
                return ;
            }
            targetThumb = thumbDir + thumbName;
            targetUploadThumb = uploadThumbDir + thumbName;

            var done = when.defer();
            fs.exists(thumbDir, function(exists) {
                if (!exists) {
                    // 创建目录
                    fs.mkdir(thumbDir, function(err) {
                        if (err) {
                            done.reject();
                            return ;
                        }

                        done.resolve(targetThumb);
                    });
                }

                done.resolve(targetThumb);
            });

            return done.promise;
        }).then(function(targetThumb) {
            if (!config.images.dir || !config.images.targetWidth || !config.images.scale) {
                return ;
            }
            if(targetThumb.indexOf('gif') > 0 ){
                return ;
            }

            var img = images(targetFilename);
            var size = img.size();
            var srcWidth = size.width;
            var srcHeight = size.height;
            var scale = config.images.scale;
            var cutWidth,cutHeight;
            if(srcHeight/srcWidth < scale ){
                cutHeight = srcHeight;
                cutWidth = srcHeight / scale;
                x = (srcWidth - cutWidth) / 2;
                y = 0;
            }else{
                cutWidth = srcWidth;
                cutHeight = srcWidth * scale;
                y = (srcHeight - cutHeight) / 2;
                x = 0;
            }
            img = images(img, x, y, cutWidth, cutHeight);  //按比例裁剪
            size = img.size(config.images.targetWidth);    //等比缩放
            srcWidth = size.width;
            srcHeight = size.height;

            var targetWidth = config.images.targetWidth || srcWidth;
            var targetHeight = config.images.targetWidth * config.images.scale || srcHeight;


            if (srcWidth < targetWidth || targetWidth <= 0) {
                targetWidth = srcWidth;
            }
            if (srcHeight < targetHeight  || targetHeight <= 0) {
                targetHeight = srcHeight;
            }

            var x = 0;
            var y = 0;
            if (targetWidth !== x || targetHeight !== y) {
                // 选取图片的居中位置坐标
                x = (srcWidth - targetWidth) / 2;
                y = (srcHeight - targetHeight) / 2;
            }

            images(img, x, y, targetWidth, targetHeight).save(targetThumb);
            //拷贝到 /data/static/images/目录  方便CDN 同步
            var index = targetThumb.indexOf('/images/');
            if(index > 0 ){
                var dir = config.cdn.syncImagesPath + targetThumb.substr(index+8);
                base.copyFile(targetThumb, dir, function() {
                    console.log("copy success");
                });
            }
            return;
        }).then(function() {
            // 创建cdn上得目录
            if (config.cdn.isProduction) {
                return nodefn.call(fs.mkdirs, uploadPath);
            }
        }).then(function() {

            var cpFile = function(src, dest) {
                var deferred = when.defer();
                fs.copy(src, dest, function(err){
                    if (err) {
                        deferred.reject(err);
                    }

                    deferred.resolve();
                });

                return deferred.promise;
            }

            // copy文件到cdn上
            if (config.cdn.isProduction) {
                if (hasThumb) {
                    return when.all([cpFile(targetFilename, uploadFilename),
                              cpFile(targetThumb, targetUploadThumb)]);
                }

                return cpFile(targetFilename, uploadFilename);
            }
        }).then(function() {
            // The src for the image must be in URI format, not a file system path, which in Windows uses \
            // For local file system storage can use relative path so add a slash
            var fullUrl = (config.paths.subdir + '/' + config.paths.imagesRelPath + '/' + path.relative(config.paths.imagesPath, targetFilename)).replace(new RegExp('\\' + path.sep, 'g'), '/');

            return saved.resolve(fullUrl);
        }).otherwise(function (e) {
            errors.logError(e);
            return saved.reject(e);
        });

        return saved.promise;
    },

    'exists': function (filename) {
        // fs.exists does not play nicely with nodefn because the callback doesn't have an error argument
        var done = when.defer();

        fs.exists(filename, function (exists) {
            done.resolve(exists);
        });

        return done.promise;
    },

    // middleware for serving the files
    'serve': function () {
        // For some reason send divides the max age number by 1000
        return express['static'](config.paths.imagesPath, {maxAge: utils.ONE_YEAR_MS});
    }
});

module.exports = localFileStore;
