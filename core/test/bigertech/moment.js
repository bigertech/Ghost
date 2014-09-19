/**
 * Created by liuxing on 14-9-16.
 */
var moment = require('moment');
var a = moment([2007, 0, 29]);
var b = moment([2007, 0, 28]);
var result = a.diff(b, 'days') // 1
console.log(result);
