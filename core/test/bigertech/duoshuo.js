/**
 * Created by liuxing on 14-8-25.
 */
var request = require('request');
var url = 'http://api.duoshuo.com/threads/counts.json?short_name=bigertech&threads=';
var id = '077ed2dd-94a0-4508-a279-0d841e60b98c';
function getCount(url){
    request(url,function(err,res){
        console.log(res.body);
    });
}
getCount(url+id);