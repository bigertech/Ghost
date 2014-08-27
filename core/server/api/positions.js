// # Posts API
var dataProvider    = require('../models'),
    positionRelations = require('./positionRelations'),
    positions;

// ## API Methods
positions = {
    findAll: function findAll(option) {
        return dataProvider.Position.findAll(option);
    },

    findOne: function findOne(data, options) {
        return dataProvider.Position.findOne(data, options);
    },

    edit: function(data, options) {
        return dataProvider.Position.forge({id: options.id}).fetch(options).then(function(object) {
            if (object) {
                return object.save(data, options);
            }
        });
    },

    add: function(data, options) {
        return dataProvider.Position.add(data, options);
    },

    destroy: function destroy(options) {
        return dataProvider.Position.destroy(options).then(function(result) {
            if (result) {
                return dataProvider.PositionRelation.where({position_id: options.id}).destroy();
            }
        });
    }
};

module.exports = positions;
