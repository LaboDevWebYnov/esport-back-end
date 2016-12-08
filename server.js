/**
 * Created by Antoine on 17/12/2015.
 */

    // Set the DEBUG environment variable to enable debug output of Swagger Middleware AND Swagger Parser
process.env.DEBUG = 'swagger:*';

// export NODE_APP_INSTANCE=def
if (!process.env.NODE_APP_INSTANCE) {
    console.error("Error : please set environment variable NODE_APP_INSTANCE before starting server");
    process.exit(1);
}

var http = require('http');
var config = require('config');
var express = require('express');
var log4js = require('log4js');
var mongoose = require('mongoose');
var mkdirp = require('mkdirp');
var compression = require('compression');
var swaggerTools = require('swagger-tools');
var responseTime = require('response-time');
var path = require('path');
var bodyParser = require('body-parser');
var token = require('./security/token');

//******************************************************************************//
//********************** DEFINING SERVER CONSTANTS ******************************//
//******************************************************************************//
var serverName = 'Project 1 server';
//var serverVersion = require('./api/swagger.json').version;
//******************************************************************************//

//******************************************************************************//
//********************** DEFINING LOGGING ***********************************//
//******************************************************************************//
configureLogging();
//******************************************************************************//

//******************************************************************************//
//********************** DEFINING COMPONENTS ***********************************//
//******************************************************************************//

//module.exports.getServerInformation = function () {
//    return serverName + ' - v' + serverVersion;
//}

function configureLogging() {
    mkdirp('./logs');
    log4js.configure(config.server.instance.log4js);
    logger = log4js.getLogger('server.core');
}

function noCache(req, res, next) {
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('Expires', '-1');
    next();
}

function allowCORS(req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    res.set("Access-Control-Expose-Headers", "Content-Type, token");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, HEAD, DELETE, OPTIONS");
    next();
}

function errorHandler(err, req, res, next) {
    logger.error(err.message, err);
    res.status(err.status || 500).send({
        message: err.message,
        error: err
    });
}

function shutdownServer() {
    logger.fatal('Shutting down server');
    //@TODO : release resources ?
    process.exit();
}
//******************************************************************************//

//******************************************************************************//
//********************** STARTING SERVER ***************************************//
//******************************************************************************//

var swaggerSpecFilePath = path.resolve(config.server.swagger.specFilePath);
var swaggerDoc = require(swaggerSpecFilePath);
logger.info('Using spec file: ' + swaggerSpecFilePath);
swaggerDoc.host = config.server.instance.host+':'+config.server.instance.port;
logger.info('Server will run at: ' + JSON.stringify(swaggerDoc.host));

var app = express();

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // Add all the Swagger Express Middleware, or just the ones you need.

    // connect logger
    app.use(log4js.connectLogger(log4js.getLogger('server.http'), {level: log4js.levels.INFO}));

    logger.info('Connecting to mongo: ', config.server.mongo.connectionString, ', options: ', config.server.mongo.options)
    mongoose.connect(config.server.mongo.connectionString, config.server.mongo.options, function (err) {
        if (err) console.log(err);
        logger.info("Connected to the database");
    });

    logger.info('Using no-cache middleware');
    app.use(noCache);

    if (config.server.http.compression) {
        logger.info('Using gzip compression middleware');
        app.use(compression());
    }

    if (config.server.http.cors) {
        logger.info('Using CORS middleware');
        app.use(allowCORS);
    }

    app.use(function (req, res, next) {
        if (req.method === 'OPTIONS') {
            res.end();
        } else {
            next();
        }
    });

    if (config.server.http.responseTime) {
        logger.info('Using response-time middleware');
        app.use(responseTime());
    }

    app.use(bodyParser.json({limit: '5mb'}));

    // logger.info('Using token handler middleware');
    // token.initialize();
    // app.use(token.tokenHandler);

    logger.info('Using Swagger Metadata middleware');
    app.use(middleware.swaggerMetadata());

    logger.info('Using Swagger Router middleware');
    app.use(middleware.swaggerRouter({
        swaggerUi: swaggerSpecFilePath,
        controllers: './controllers',
        useStubs: false
    }));

    if (config.server.swagger.ui) {
        logger.info('Using Swagger UI middleware');
        app.use(middleware.swaggerUi());
    }

    if (config.server.swagger.apiDoc) {
        logger.info('Publishing spec file to URL /api-docs');
        app.use('/api-docs', function (req, res) {
            res.json(swaggerDoc);
        });
    }

    logger.info('Using error handler middleware');
    app.use(errorHandler);

    var port = config.server.instance.port;
    var host = config.server.instance.host;

    http.createServer(app).listen(port, function (err) {
        if (err) logger.error(err.message);
        console.log('The API sample is now running at http://'+host+':' + port);
    });

});

//******************************************************************************//