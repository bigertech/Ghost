var _              = require('lodash'),
    ghostBookshelf = require('./base'),
    PositionRelation = require('./positionRelation').PositionRelation,
    Position,
    Positions;

Position = ghostBookshelf.Model.extend({
    hasTimestamps: false,
    tableName: 'positions',

    posts: function () {
        return this.belongsToMany(require('./post').Post).through(PositionRelation);
    }
});

Positions = ghostBookshelf.Collection.extend({
    model: Position
});

module.exports = {
    Position: Position,
    Positions: Positions
};
