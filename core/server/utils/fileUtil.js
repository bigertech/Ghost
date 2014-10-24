/**
 * Created by liuxing on 14-10-24.
 */
var fs = require('fs');

// 文件拷贝
var createFloder = function(path, callback) {
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

var copyFile = function(fileInPath, fileOutPath, callback) {
    var fileOutFolderPath = fileOutPath.substr(0, fileOutPath.lastIndexOf('/'));
        createFloder(fileOutFolderPath, function() {
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
module.exports = {
    copyFile:copyFile
};