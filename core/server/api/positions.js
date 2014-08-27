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

    /**
     * 按专题id得到文章
     * @param  {String} slug
     * @return
     */
    getPostsByPositionSlug: function(slug) {
        return dataProvider.Position.findOne({slug: slug ? slug.trim() : ''}, { withRelated: 'posts' }).then(function(position) {
            if (position) {
                return posts.findByIn(position.toJSON().posts);
            }

            return null;
        });
    },

    /**
     * 按专题名称得到文章
     * @param  {String} name
     * @return
     */
    getPostsByPositionName: function(name) {
        return dataProvider.Position.findOne({name: name ? name.trim() : ''}, { withRelated: 'posts' }).then(function(position) {
            if (position) {
                return posts.findByIn(position.toJSON().posts);
            }

            return null;
        });
    },

    findAll: function(options) {
        return dataProvider.Position.findAll(options).then(function(positions) {
            if (positions) {
                return positions.toJSON();
            }

            return null;
        });
    },

    findOne: function findOne(data, options) {
        return dataProvider.Position.findOne(data, options).then(function(position) {
            if (position) {
                return position.toJSON();
            }

            return null;
        });
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
