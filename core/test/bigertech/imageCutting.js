process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../../server/config');
var images  = require('images');
var path    = require('path');
var _       = require('lodash');
config.images = {
    dir: 'image_sm',
    targetWidth: 350,
    targetHeight: 210,
    scale: 105/175
};
var fs = require('fs');
var dirname = path.join(config.paths.imagesPath,'/2014/Aug');
target = dirname +'/image_sm/';
fs.readdir(dirname, function(err,files) {
    var filter = ['.DS_Store'];
     files.forEach(function(file) {
         //imageCutting(dirname+'/'+files[0], target+files[0]);
        var currentFile = file;
         if(!_.contains(filter,currentFile)){
             console.log(currentFile);
             try{
                imageCutting(dirname+'/'+currentFile, target+currentFile);
             //console.log(file);
             }catch(e){
                console.log(e);
             }
         }
     });

});

/**
 * 剪辑图片
 * @param  {String} targetFilename 需要被剪辑的图片
 * @param  {String} targetThumb    裁剪后图片的存放位置
 * @return
 */
function imageCutting(targetFilename, targetThumb) {
    if (!config.images.dir || !config.images.targetWidth || !config.images.scale) {
        console.log('fail');
        return ;
    }

    var img = images(targetFilename);
    var size = img.size(config.images.targetWidth);
    var srcWidth = size.width;
    var srcHeight = size.height;
    var targetWidth = config.images.targetWidth || srcWidth;
    var targetHeight = config.images.targetWidth * config.images.scale || srcHeight;

    // img.size()
    // if (targetWidth > targetHeight) {
    // } else if (targetWidth < targetHeight) {
    // }

    // img.size(srcWidth, srcHeight);
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
}
