/**
 * Created by tdoret on 08/03/2017.
 */
'use strict';

var Promise = require("bluebird"),
    config = require('config'),
    logger = require('log4js').getLogger('controller.registration'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    emailUtils = require('./utils/emailUtils.js'),
    mailgun = require('mailgun-js')({
        apiKey: config.server.features.email.smtp.mailgun.apiKey,
        domain: config.server.features.email.smtp.mailgun.domain
    }),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    UserService = require('../services/UserService'),
    streamingService = require('../services/StreamingService');

mongoose.Promise = Promise;

// Path: GET api/streaming/{streamingName}/getStreamingByLikeName
module.exports.getStreamingByLikeName = function getStreamingByLikeName(req, res, next) {
    var partialTwitchUser = decodeURIComponent(Util.getPathParams(req)[2]);

    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);
    logger.info('Getting the team with name:' + partialTwitchUser);
    // Code necessary to consume the Team API and respond
    streamingService.getStreamByUserPartial(partialTwitchUser, function (error, resp, body) {
        //logger.debug('resp : '+JSON.stringify(resp));
        //logger.debug('debug : '+body);
        if(!error && !_.isNull(body)){
            res.set('Content-Type', 'application/json');
            res.status(resp.statusCode).end(body);
        }
    });
    //res.status(200).end(JSON.stringify(decodeURIComponent(Util.getPathParams(req)[2]) || {}, null, 2));

};

// Path: GET api/streaming/{streamingName}/getStreamingByName
module.exports.getStreamingByName = function getStreamingByName(req, res, next) {
    var twitchUser = decodeURIComponent(Util.getPathParams(req)[2]);

    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);
    logger.info('Getting the stream with name:' + twitchUser);

    streamingService.getStreamByUserStrict(twitchUser, function (error, resp, body) {
        //logger.debug('resp : '+JSON.stringify(resp));
        //logger.debug('debug : '+body);
        if(!error && !_.isNull(body)){
            res.set('Content-Type', 'application/json');
            res.status(resp.statusCode).end(body);
        }
    });
    //res.status(200).end(JSON.stringify(decodeURIComponent(Util.getPathParams(req)[2]) || {}, null, 2));

};

// Path: GET api/streaming/getLiveStreaming
module.exports.getLiveStreaming = function getLiveStreaming(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    streamingService.getLiveStream(function (error, resp, body) {
        //logger.debug('resp : '+JSON.stringify(resp));
        //logger.debug('debug : '+body);
        if(!error && !_.isNull(body)){
            res.set('Content-Type', 'application/json');
            res.status(resp.statusCode).end(body);
        }
    });

};