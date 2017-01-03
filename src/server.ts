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

import http = require('http');
let config = require('config');
import express = require('express');
import log4js = require('log4js');
import mongoose = require('mongoose');
let mkdirp = require('mkdirp');
import compression = require('compression');
let swaggerTools = require('swagger-tools');
import responseTime = require('response-time');
import path = require('path');
import bodyParser = require('body-parser');
import token = require('./security/token');

let logger: any;

//******************************************************************************//
//********************** DEFINING SERVER CONSTANTS ******************************//
//******************************************************************************//
const serverName = 'Project 1 server';
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

function noCache(res: express.Response, next) {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    next();
}

function allowCORS(res: express.Response, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    res.setHeader("Access-Control-Expose-Headers", "Content-Type, token");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, HEAD, DELETE, OPTIONS");
    next();
}

function errorHandler(err, res: express.Response) {
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

const swaggerSpecFilePath: string = path.resolve(config.server.swagger.specFilePath);
let swaggerDoc: any = require(swaggerSpecFilePath);
logger.info('Using spec file: ' + swaggerSpecFilePath);
swaggerDoc.host = config.server.instance.host + ':' + config.server.instance.port;
logger.info('Server will run at: ' + JSON.stringify(swaggerDoc.host));

let app = express();

swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
    // Add all the Swagger Express Middleware, or just the ones you need.

    // connect logger
    app.use(log4js.connectLogger(log4js.getLogger('server.http'), {level: log4js.levels.INFO}));

    logger.info('Connecting to mongo: ', config.server.mongo.connectionString, ', options: ', config.server.mongo.options);
    mongoose.connect(config.server.mongo.connectionString, config.server.mongo.options, (err) => {
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

    app.use((req, res, next) => {
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
        app.use('/api-docs', (req, res) => {
            res.json(swaggerDoc);
        });
    }

    logger.info('Using error handler middleware');
    app.use(errorHandler);

    const port = config.server.instance.port;
    const host = config.server.instance.host;

    http.createServer(app).listen(port, (err) => {
        if (err) logger.error(err.message);
        console.log('The API sample is now running at http://' + host + ':' + port);
    });
});
//******************************************************************************//