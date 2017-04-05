var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.playerAccount'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    newsService = require('../services/NewsService');

mongoose.Promise = Promise;


module.exports.getNews = function getPlayerAccountList(req, res, next) {
    let news= {};
    newsService.getNewsIgn(function (err, newIgn) {
        if (err) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(newIgn || {}, null, 2);
        }

        logger.debug(newIgn);
        if (!_.isNull(newIgn) || !_.isEmpty(newIgn)) {
            news['ign'] = newIgn;
            newsService.getNewsPolygon(function (err, newPolygon) {
                if (err) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(newPolygon || {}, null, 2);
                }

                logger.debug(newPolygon);
                if (!_.isNull(newPolygon) || !_.isEmpty(newPolygon)) {
                    news['polygon'] = newPolygon;
                    res.set('Content-Type', 'application/json');
                    res.status(200).json(news || {}, null, 2);
                }
                else {
                    next(err);
                }
            });
        }
        else {
            next(err);
        }
    });
};

module.exports.getNewsIgn = function getPlayerAccountList(req, res, next) {
    logger.info('Getting News from News API...');

    newsService.getNewsIgn(function (err, news) {
        if (err) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }

        logger.debug(news);
        if (!_.isNull(news) || !_.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(200).json(news || {}, null, 2);
        }
        else {
            next(err);
        }
    });
};


module.exports.getNewsPolygon = function getPlayerAccountList(req, res, next) {
    logger.info('Getting News from News API...');

    newsService.getNewsPolygon(function (err, news) {
        if (err) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }

        logger.debug(news);
        if (!_.isNull(news) || !_.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(200).json(news || {}, null, 2);
        }
        else {
            next(err);
        }
    });

};