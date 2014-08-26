/**
 * Created by liuxing on 14-8-25.
 */
var request         = require('request'),
    youkuUrl        = 'https://openapi.youku.com/v2/videos/show.json';

var data = {
    url: youkuUrl,
    qs: {
        client_id: '2cf898d1c36ea115',
        video_id : 'XNzI1NDU4ODI0',
        ext: 'view_count,up_count'
    }
};
request(data,function(err,data){
    if(err){
        console.error(err);
    }
    console.log(JSON.parse(data.body));
});