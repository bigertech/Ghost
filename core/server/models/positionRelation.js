var _              = require('lodash'),
    ghostBookshelf = require('./base'),
    PositionRelation,
    PositionRelations;

PositionRelation = ghostBookshelf.Model.extend({
    hasTimestamps: false,
    tableName: 'position_relations',

    initialize: function () {
    },

    defaults: function () {
    },

    posts: function() {
        return this.belongsTo(require('./post').Post, 'post_id');
    },

    positions: function() {
        return this.belongsTo(require('./position').Position, 'position_id');
    }
}, {
    edit: function(data, options) {
        return ghostBookshelf.Model.edit.call(this, data, options);
    },

    add: function(data, options) {
        return ghostBookshelf.Model.add.call(this, data, options);
    }
});

PositionRelations = ghostBookshelf.Collection.extend({
    model: PositionRelation
});

module.exports = {
    PositionRelation: PositionRelation,
    PositionRelations: PositionRelations
};
