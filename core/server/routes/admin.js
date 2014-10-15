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

    router.get('/ghost/positions/', admin.positions);

    router.get('/ghost/positionsJson/', admin.positionsJson);

    router.post('/ghost/positions/add/', admin.positionsAdd);

    router.get('/ghost/positions/delete/:id/', admin.positionsDelete);

    router.post('/ghost/positions/update/', admin.positionsUpdate);

    router.get('/ghost/position/:id/', admin.position);

    router.get('/ghost/positionJson/:id/', admin.positionJson);

    router.post('/ghost/position/add/', admin.positionAdd);

    router.post('/ghost/position/update/', admin.positionUpdate);

    router.get('/ghost/position/delete/:id/', admin.positionDelete);

    router.get('/ghost/*', middleware.redirectToSetup, admin.index);

    return router;
};

module.exports = adminRoutes;
