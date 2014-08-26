// # Posts API
var _ = require('lodash'),
    when = require('when'),
    dataProvider    = require('../models'),
    positionRelations;

// ## API Methods
positionRelations = {
    findByPositionId: function findByPositionId(id) {
        if (!id || !_.isNumber(parseInt(id))) {
            return when.reject([]);
        }

        return dataProvider['PositionRelation']
                .where({position_id: id})
                .fetchAll()
                .then(function(result) {
            return when.resolve(result.toJSON());
        });
    },

    edit: function(data, options) {
        return dataProvider['PositionRelation'].forge({id: options.id}).fetch(options).then(function(object) {
            if (object) {
                return object.save(data, options);
            }
        });
    }
};

module.exports = positionRelations;
