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

    edit: function edit(id, data) {
        var options = { id: id};
        return dataProvider.Position.edit(data, options);
    },

    destroy: function destroy(id) {
        var options = { id: id };

        return dataProvider.Position.destroy(options);
    }
};

module.exports = positions;
