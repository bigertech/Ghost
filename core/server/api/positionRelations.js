// # Posts API
var _ = require('lodash'),
    when = require('when'),
    dataProvider    = require('../models'),
    positionRelations;

// ## API Methods
positionRelations = {
    findByPositionId: function findByPositionId(id, options) {
        options = options || {};
        if (!id || !_.isNumber(parseInt(id))) {
            return when.reject([]);
        }

        var qb = dataProvider['PositionRelation'].where({position_id: id});
        if (options.publish !== undefined) {
            qb.where({publish : options.publish});
        }

        if (options.target !== undefined) {
            qb.where({target : options.target});
        }

        return qb.fetchAll().then(function(result) {
            return when.resolve(result.toJSON());
        });
    },

    add: function(data, options) {
        return dataProvider['PositionRelation'].add(data, options);
    },

    edit: function(data, options) {
        return dataProvider['PositionRelation'].forge({id: options.id}).fetch(options).then(function(object) {
            if (object) {
                return object.save(data, options);
            }
        });
    },

    destroy: function(options) {
        return dataProvider['PositionRelation'].destroy(options);
    }
};

module.exports = positionRelations;
