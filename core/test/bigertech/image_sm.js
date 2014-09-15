/**
 * Created by liuxing on 14-9-12.
 */
var image_url = '/content/images/2014/Jul/1-1.jpg';
var last_slug = image_url.lastIndexOf('\/');

var result = image_url.substr(0,last_slug)+'/image_sm'+image_url.substr(last_slug,image_url.length);
console.log(result);
