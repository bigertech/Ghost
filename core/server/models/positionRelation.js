var _              = require('lodash'),
    ghostBookshelf = require('./base'),
    PositionRelation,
    PositionRelations;

PositionRelation = ghostBookshelf.Model.extend({
    hasTimestamps: false,
    tableName: 'position_relations',

    posts: function() {
        return this.belongsTo(require('./post').Post, 'post_id');
    },

    positions: function() {
        return this.belongsTo(require('./position').Position, 'position_id');
    }
});

PositionRelations = ghostBookshelf.Collection.extend({
    model: PositionRelation
});

module.exports = {
    PositionRelation: PositionRelation,
    PositionRelations: PositionRelations
};
