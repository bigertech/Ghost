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
}, {

    permittedOptions: function (methodName) {
        var options = ghostBookshelf.Model.permittedOptions(),
            validOptions = {
                findAll: ['withRelated'],
                findOne: ['withRelated']
            };

        if (validOptions[methodName]) {
            options = options.concat(validOptions[methodName]);
        }

        return options;
    },

    findOne: function(data, options) {
        return ghostBookshelf.Model.findOne.call(this, data, options);
    }
});

Positions = ghostBookshelf.Collection.extend({
    model: Position
});

module.exports = {
    Position: Position,
    Positions: Positions
};
