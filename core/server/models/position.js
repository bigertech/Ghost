var _              = require('lodash'),
    ghostBookshelf = require('./base'),
    Post           = require('./post').Post,
    Position,
    Positions;

Position = ghostBookshelf.Model.extend({
    hasTimestamps: false,
    tableName: 'positions',

    post: function() {
        return this.hasOne(Post, 'post_id');
    }
}, {
    findAll: function(options) {
        options = options || {};
        options.withRelated = _.union(['fields'], options.include);

        return ghostBookshelf.Model.findAll.call(this, options.include);
    },

    edit: function(data, options) {
        return ghostBookshelf.Model.edit.call(this, data, options);
    }
});

Positions = ghostBookshelf.Collection.extend({
    model: Position
});

module.exports = {
    Position: Position,
    Positions: Positions
};
