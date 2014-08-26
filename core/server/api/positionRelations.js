// # Posts API
var dataProvider    = require('../models'),
    positionRelations;

// ## API Methods
positionRelations = {
    findAll: function findAll(option) {
        return dataProvider.PositionRelation.findAll(option);
    },

    edit: function edit(id, data) {
        var options = { id: id};
        return dataProvider.PositionRelation.edit(data, options);
    },

    destroy: function destroy(id) {
        var options = { id: id };

        return dataProvider.PositionRelation.destroy(options);
    }
};

module.exports = positionRelations;
