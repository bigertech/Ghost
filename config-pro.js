// # Ghost Configuration
// Setup your Ghost install for various environments
// Documentation can be found at http://support.ghost.org/config/

var path = require('path'),
    config;

config = {
    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site, E.g. in RSS and email.
        url: 'http://www.bigertech.com',

        // Example mail config
        // Visit http://support.ghost.org/mail for instructions
        mail: {
            transport: 'SMTP',
            options: {
                auth: {
                    user: 'bigertech@gmail.com', // mailgun username
                    pass: 'FEIzao=2014'  // mailgun password
                }
            }
        },

        database: {
            client: 'mysql',
            connection: {
                host     : '192.168.20.21',
                user     : 'meizu_bigertech',
                password : 'nkLWmeUSPwlbLtNU',
                database : 'bigertech_blog',
                charset  : 'UTF8_GENERAL_CI'
            },
            //debug: true
        },
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '121.14.58.212',
            // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
            port: '8001'
        },
        paths: {
            contentPath: path.join(__dirname, '/content/')
        },
        cdn: {
            isProduction: true,
            staticAssetsUrl: 'http://bigertech.res.meizu.com/blog/static/',
            dynamicAssetsUrl: 'http://bigertech.res.meizu.com/blog/res/content/images/',
            syncImagesPath: '/data/static/images/'
        },
        images: {
            // 如果下面几项留空，则说明上传的图片无需截图
            dir: 'image_sm',
            targetWidth: 350,
            targetHeight: 210,
            scale: 0.6
        },
        changweibo: {
            url: 'http://www.bigertech.com',
            dir: 'changweibo'
        }
    },

    // ### Production
    // When running Ghost in the wild, use the production environment
    // Configure your URL and mail settings here
    production: {
        url: 'http://my-ghost-blog.com',
        mail: {},
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost.db')
            },
            debug: false
        },
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
            port: '2368'
        }
    },

    // **Developers only need to edit below here**

    // ### Testing
    // Used when developing Ghost to run tests and check the health of Ghost
    // Uses a different port number
    testing: {
        url: 'http://127.0.0.1:2369',
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost-test.db')
            }
        },
        server: {
            host: '127.0.0.1',
            port: '2369'
        },
        logging: false
    },

    // ### Testing MySQL
    // Used by Travis - Automated testing run through GitHub
    'testing-mysql': {
        url: 'http://127.0.0.1:2369',
        database: {
            client: 'mysql',
            connection: {
                host     : '127.0.0.1',
                user     : 'root',
                password : '',
                database : 'bigertech_blog',
                charset  : 'utf8'
            }
        },
        server: {
            host: '127.0.0.1',
            port: '2369'
        },
        logging: false
    },

    // ### Testing pg
    // Used by Travis - Automated testing run through GitHub
    'testing-pg': {
        url: 'http://127.0.0.1:2369',
        database: {
            client: 'pg',
            connection: {
                host     : '127.0.0.1',
                user     : 'postgres',
                password : '',
                database : 'ghost_testing',
                charset  : 'utf8'
            }
        },
        server: {
            host: '127.0.0.1',
            port: '2369'
        },
        logging: false
    }
};

// Export config
module.exports = config;
