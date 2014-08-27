// # Posts API
var dataProvider    = require('../models'),
    posts = require('./posts'),
    positionRelations = require('./positionRelations'),
    positions;

// ## API Methods
positions = {
    /**
     * 按专题id得到文章
     * @param  {Number} posId
     * @return          1. 专题不存在，则返回null
     *                  2. 专题下文章为0，则返回[]
     *                  3. 文章数组
     */
    getPostsByPositionId: function(posId) {
        return dataProvider.Position.findOne({id: posId}, { withRelated: 'posts' }).then(function(position) {
            if (position) {
                return posts.findByIn(position.toJSON().posts);
            }

            return null;
        });
    },

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
