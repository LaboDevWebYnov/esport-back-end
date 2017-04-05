var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.playerAccount'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    newsService = require('../services/NewsService');

mongoose.Promise = Promise;

//Path: GET api/playerAccounts
module.exports.getNews = function getPlayerAccountList(req, res, next) {
    logger.info('Getting News from News API...');

    newsService.getNews(function (err,news) {
        if (err)
            res.set('Content-Type', 'application/json');
            res.status(200).json( news || {}, null, 2);

        logger.debug(news);
        if (_.isNull(news) || _.isEmpty(news)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(news || {}, null, 2);
        }
        else {
            next(err);
        }
    });

};