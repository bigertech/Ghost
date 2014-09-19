process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../../server/config');
var images  = require('images');
var path    = require('path');
var _       = require('lodash');
var fs = require('fs');
var util = require("util");
var stream = require('stream');

config.images = {
    dir: 'image_sm',
    targetWidth: 350,
    targetHeight: 210,
    scale: 0.6,
    copyPath: '/data/static/images/'
};
var dirname = path.join(config.paths.imagesPath,'/2014/Aug'),
    image_sm = '/image_sm/',
    target = dirname + image_sm ;
//fs.readdir(dirname, function(err,files) {
//     files.forEach(function(file) {
//         cutImg(file);
//     });
//});
var filter = ['.DS_Store,.svn'];
var base = base || {};


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


/**
 * 剪辑图片
 * @param  {String} targetFilename 需要被剪辑的图片
 * @param  {String} targetThumb    裁剪后图片的存放位置
 * @return
 */
function imageCutting(targetFilename, targetThumb,target2) {
    if (!config.images.dir || !config.images.targetWidth || !config.images.scale) {
        console.log('fail');
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
    console.log('canjian: '+targetThumb);
    images(img, x, y, targetWidth, targetHeight).save(targetThumb);
    //拷贝到 /data/static/images/目录  方便CDN 同步
    var index = targetThumb.indexOf('/images/');
    if(index > 0 ){
        var dir = config.images.copyPath+targetThumb.substr(index+8);
        base.copyFile(targetThumb, dir, function() {
            console.log("copy success");
        });
    }
}


function cutImg(file){
    var currentFile = file;
    if(!_.contains(filter,currentFile)){
        console.log(currentFile);
        var targetThunnmb = target+currentFile;

        try{
            imageCutting(dirname+'/'+currentFile, targetThunnmb);
            //console.log(file);
        }catch(e){
            console.log(e);
        }
    }
}
cutImg('00.jpg');