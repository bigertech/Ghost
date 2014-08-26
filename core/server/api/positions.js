// # Posts API
var dataProvider    = require('../models'),
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
        return dataProvider.Position.destroy(options);
    }
};

module.exports = positions;
