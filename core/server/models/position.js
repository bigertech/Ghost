var _              = require('lodash'),
    ghostBookshelf = require('./base'),
    PositionRelation = require('./positionRelation').PositionRelation,
    Position,
    Positions;

Position = ghostBookshelf.Model.extend({
    hasTimestamps: false,
    tableName: 'positions',

    initialize: function () {
    },

    defaults: function () {
    },

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
    },
    findAll: function(data, options) {
        return ghostBookshelf.Model.findAll.call(this, data, options);
    },

    edit: function(data, options) {
        return ghostBookshelf.Model.edit.call(this, data, options);
    },

    add: function(data, options) {
        return ghostBookshelf.Model.add.call(this, data, options);
    },

    destroy: function(options) {
        return ghostBookshelf.Model.destroy.call(this, options);
    }
});

Positions = ghostBookshelf.Collection.extend({
    model: Position
});

module.exports = {
    Position: Position,
    Positions: Positions
};
