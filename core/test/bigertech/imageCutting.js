
var config = require('../../server/config');
var images  = require('images');

var fs = require('fs');

fs.readDir('dirname', function(files) {
    // files.forEach(function(file) {
        // imageCutting(file, target);
    // });
});

/**
 * 剪辑图片
 * @param  {String} targetFilename 需要被剪辑的图片
 * @param  {String} targetThumb    裁剪后图片的存放位置
 * @return
 */
function imageCutting(targetFilename, targetThumb) {
    if (!config.images.dir || !config.images.targetWidth || !config.images.scale) {
        return ;
    }

    var img = images(targetFilename);
    var size = img.size();
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
