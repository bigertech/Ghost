var _             = require('lodash'),
    when          = require('when'),
    api           = require('../api'),
    errors        = require('../errors'),
    updateCheck   = require('../update-check'),
    adminControllers;

adminControllers = {
    // Route: index
    // Path: /ghost/
    // Method: GET
    'index': function (req, res) {
        /*jslint unparam:true*/

        function renderIndex() {
            res.render('default');
        }

        updateCheck().then(function () {
            return updateCheck.showUpdateNotification();
        }).then(function (updateVersion) {
            if (!updateVersion) {
                return when.resolve();
            }

            var notification = {
                type: 'success',
                location: 'top',
                dismissible: false,
                status: 'persistent',
                message: '<a href="https://ghost.org/download">Ghost ' + updateVersion +
                '</a> 已经可以使用! 太好了. 请点击 <a href="http://support.ghost.org/how-to-upgrade/">更新</a> '
            };

            return api.notifications.browse({context: {internal: true}}).then(function (results) {
                if (!_.some(results.notifications, { message: notification.message })) {
                    return api.notifications.add({ notifications: [notification] }, {context: {internal: true}});
                }
            });
        }).finally(function () {
            renderIndex();
        }).catch(errors.logError);
    },

    'positionsIndex': function(req, res) {
        api.positions.findAll().then(function(result) {
            res.render('positions/index', {
                positions: result.toJSON(),
                pageTitle: '添加位置'
            });
        });
    },

    'positions': function(req, res) {
        // var data = {};

        // api.positions.findAll().then(function(positions) {
        //     data.positions = positions.toJSON();

        //     return api.posts.browse();
        // }).then(function(posts) {
        //     data.posts = [];
        //     posts.posts.forEach(function(post) {
        //         data.posts.push(_.pick(post, 'id', 'title'))
        //     });

        //     res.jsonp(data);
        // });

        // api.positionRelations.findAll({withRelated: ['post']}).then(function(result) {
        //     res.jsonp(result.toJSON());
        // });


        // var Post = require('../models').Post;
        // Post.where({id: 2}).fetch({withRelated: ['positions']}).then(function(position) {
        //     console.log(position.toJSON().positions);
        // });

        // var Position = require('../models').Position;
        // Position.forge({id: 2}).fetch({withRelated: ['posts']}).then(function(position) {
        //     console.log(position.toJSON());
        // });

        // api.positionRelations.edit({post_id: 3}, {id: 1}).then(function(real) {
        //     console.log(real);
        // });
    },

    'position': function(req, res, next) {
        if (!req.params.id) {
            return errors.error404(req, res, next);
        }

        var id = req.params.id || 0;
        var data = { activeId: id };

        var self = this;
        api.positions.findOne({id: id}).then(function(result) {
            if (!result) {
                return when.reject('Not found.');
            }

            data.pageTitle = result.toJSON().name;
            return api.positions.findAll();
        }).then(function(result) {
            data.positions = result.toJSON();
            res.render('positions/position', data);
        }).otherwise(function(err) {
            return errors.error404(req, res, next);
        });
    },

    positionJson: function(req, res) {
        var data = {};
        var id = req.params.id || 0;

        api.positionRelations.findByPositionId(id).then(function(result) {
            var sortId = _.property('id');
            data.posReals = _.sortBy(result, function(value) {
                return 100000 - value.id;
            }, Math);

            var ids = [];
            result.forEach(function(item) {
                ids.push(item.post_id);
            });

            return api.posts.findByIn(ids);
        }).then(function(result) {
            result.forEach(function(post) {
                data.posReals.forEach(function(item) {
                    if (item.post_id == post.id) {
                        item.post_title = post.title || '';
                    }
                });
            });

            return api.posts.browse();
        }).then(function(result) {
            data.posts = [];
            result.posts.forEach(function(post) {
                data.posts.push(_.pick(post, 'id', 'title'));
            });

            res.jsonp(data);
        });
    },

    'positionAdd': function(req, res) {
        var data = req.body;

        delete data.id;

        api.positionRelations.add(data).then(function(rela) {
            if (!rela) {
                res.jsonp({ status: false });
                return ;
            }

            res.jsonp({status: true});
        });
    },

    'positionUpdate': function(req, res) {
        var data = req.body;

        api.positionRelations.edit(data, {id: data.id}).then(function(real) {
            if (!real) {
                res.jsonp({ status: false });
                return ;
            }

            res.jsonp({status: true});
        });
    },

    'positionDelete': function(req, res) {
        api.positionRelations.destroy({id: req.params.id}).then(function(result) {
            if (!result) {
                res.jsonp({ status: false });
                return ;
            }

            res.jsonp({status: true});
        });
    }
};

module.exports = adminControllers;
