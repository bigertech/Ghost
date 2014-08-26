var admin       = require('../controllers/admin'),
    config      = require('../config'),
    express     = require('express'),
    utils       = require('../utils'),

    adminRoutes;

adminRoutes = function (middleware) {
    var router = express.Router(),
        subdir = config.paths.subdir;

    // ### Admin routes
    router.get(/^\/(logout|signout)\/$/, function redirect(req, res) {
        /*jslint unparam:true*/
        res.set({'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_S});
        res.redirect(301, subdir + '/ghost/signout/');
    });
    router.get(/^\/signup\/$/, function redirect(req, res) {
        /*jslint unparam:true*/
        res.set({'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_S});
        res.redirect(301, subdir + '/ghost/signup/');
    });

    // redirect to /ghost and let that do the authentication to prevent redirects to /ghost//admin etc.
    router.get(/^\/((ghost-admin|admin|wp-admin|dashboard|signin|login)\/?)$/, function (req, res) {
        /*jslint unparam:true*/
        res.redirect(subdir + '/ghost/');
    });

    router.get('/ghost/positionsIndex/', admin.positionsIndex);

    router.get('/ghost/positions/', admin.positions);

    router.get('/ghost/position/:id/', admin.position);

    router.get('/ghost/positionJson/:id/', admin.positionJson);

    router.post('/ghost/position/add/', admin.positionAdd);

    router.post('/ghost/position/update/', admin.positionUpdate);

    router.post('/ghost/position/delete/', admin.positionDelete);

    router.get('/ghost/*', middleware.redirectToSetup, admin.index);

    return router;
};

module.exports = adminRoutes;
