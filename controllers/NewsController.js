var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.news'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    async = require('async'),
    Util = require('./utils/util.js'),
    newsService = require('../services/NewsService');

mongoose.Promise = Promise;

module.exports.getNews = function getPlayerAccountList(req, res, next) {
    logger.info('Getting All News from News API...');
    let news = {};
    async.parallel([

        function (cb) {
            newsService.getNewsIgn(function (err, newIgn) {
                if (err) {
                    cb(err, 'retrieve ign news');
                }
                else {
                    logger.debug(newIgn);
                    news['ign'] = newIgn;
                    cb(null, 'retrieve ign news');
                }
            });
        }
    ], function (err, results) {
        logger.debug(results);
        if (!_.isNull(err) || !_.isEmpty(err)) {
            logger.debug(err);
            return next(err);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.status(200).json(news || {}, null, 2);
        }
    });
};

module.exports.getNewsIgn = function getPlayerAccountList(req, res, next) {
    logger.info('Getting Ign News from News API...');

    newsService.getNewsIgn(function (err, news) {
        if (err) {
            return next(err);
        }
        else if (_.isNull(news) || _.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }
        else {
            logger.debug(news);

            res.set('Content-Type', 'application/json');
            res.status(200).json(newsSearched || {}, null, 2);
        }
    });
};
module.exports.getNewsSearch = function getNewsSearch(req, res, next) {
    var query = decodeURIComponent(Util.getPathParams(req)[2]);
    let newsSearched = {};
    newsService.getNewsSearch(query,function (err, news) {
        if (err) {
            return next(err);
        }
        else if (_.isNull(news) || _.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }
        else {
            logger.debug(news);
            newsSearched['ign'] = news;
            logger.debug(newsSearched);
            res.set('Content-Type', 'application/json');
            res.status(200).json(newsSearched || {}, null, 2);
        }
    });
    //res.status(200).end(JSON.stringify(decodeURIComponent(Util.getPathParams(req)[2]) || {}, null, 2));

};


module.exports.getNewsIgn = function getPlayerAccountList(req, res, next) {
    logger.info('Getting Ign News from News API...');

    newsService.getNewsIgn(function (err, news) {
        if (err) {
            return next(err);
        }
        else if (_.isNull(news) || _.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }
        else {
            logger.debug(news);
            res.set('Content-Type', 'application/json');
            res.status(200).json(news || {}, null, 2);
        }
    });
};

module.exports.getNewsPolygon = function getPlayerAccountList(req, res, next) {
    logger.info('Getting Polygon News from News API...');

    newsService.getNewsPolygon(function (err, news) {
        if (err) {
            return next(err);
        }

        if (_.isNull(news) || _.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }
        else {
            logger.debug(news);
            res.set('Content-Type', 'application/json');
            res.status(200).json(news || {}, null, 2);
        }
    });
};