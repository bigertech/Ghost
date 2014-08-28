/**
 * Created by liuxing on 14-8-27.
 */
var _       = require('lodash');
var data = { 'name': 'fred', 'age': 40 };
data = _.omit(data, function(value) {
    return typeof value == 'number';
});
console.log(data);