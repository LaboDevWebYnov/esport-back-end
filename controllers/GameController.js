/**
 * Created by Antoine on 08/01/2016.
 */
'use strict';

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.game'),
    mongoose = require('mongoose'),
    GameDB = require('../models/GameDB'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    Game = mongoose.model('Game'),
    PlayerAccountDB = require('../models/PlayerAccountDB'),
    PlayerAccount = mongoose.model('PlayerAccount');

mongoose.Promise = Promise;

//Path: GET api/games
module.exports.getGames = function getGames(req, res, next) {
    logger.info('Getting all games from db...');
    // Code necessary to consume the Game API and respond
    Game.find({}, function (err, games) {
        if (err) {
            return next(err.message);
        }
        if (_.isNull(games) || _.isEmpty(games)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(games || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(games || {}, null, 2));
        }
    });
};

//Path: GET api/games/addGame
module.exports.addGame = function addGame(req, res, next) {
    logger.info('Adding new game...');
    // Code necessary to consume the Game API and respond
    var game = new Game({
        name: sanitizer.escape(req.body.name),
        releaseDate: sanitizer.escape(req.body.releaseDate),
        multiPlayer: sanitizer.escape(req.body.multiPlayer),
        description: sanitizer.escape(req.body.description),
        editor: sanitizer.escape(req.body.editor),
        created_at: sanitizer.escape(req.body.created_at),
        updated_at: sanitizer.escape(req.body.updated_at)

    });

    game.save(function (err, game) {
        if (err)
            return next(err.message);

        if (_.isNull(game) || _.isEmpty(game)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(game || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(game || {}, null, 2));
        }

    });
};

// Path: GET api/games/{gameId}/getGameById
module.exports.getGameById = function getGameById(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the game with id:' + Util.getPathParams(req)[2]);
    // Code necessary to consume the Game API and respond

    Game.findById(
        Util.getPathParams(req)[2],
        function (err, game) {
            if (err)
                return next(err.message);

            logger.debug(game);
            if (_.isNull(game) || _.isEmpty(game)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(game || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(game || {}, null, 2));
            }
        }
    );
};


// Path: GET api/games/{gameName}/getGameByName
module.exports.getGameByName = function getGameByName(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the game with name:' + decodeURIComponent(Util.getPathParams(req)[2]));
    // Code necessary to consume the Game API and respond

    Game.findOne(
        {name: decodeURIComponent(Util.getPathParams(req)[2])},
        function (err, game) {
            if (err)
                return next(err.message);

            logger.debug(game);

            if (_.isNull(game) || _.isEmpty(game)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(game || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(game || {}, null, 2));
            }
        }
    );
};

// Path: PUT api/games/{gameId}/updateGame/
module.exports.updateGame = function updateGame(req, res, next) {
    logger.info('Updating the game with id:' + Util.getPathParams(req)[2]);
    Game.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                //TODO Check that it won't set not updated attributes to 'null'
                name: sanitizer.escape(req.body.name),
                releaseDate: sanitizer.escape(req.body.releaseDate),
                multiPlayer: sanitizer.escape(req.body.multiPlayer),
                description: sanitizer.escape(req.body.description),
                editor: sanitizer.escape(req.body.editor),
                active: sanitizer.escape(req.body.active)
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedGame) {
            if (err)
                return next(err.message);
            else {
                logger.debug("Updated game object: \n" + updatedGame);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedGame || {}, null, 2));
            }
        });
};

// Path: PUT api/games/{gameId}/deleteGame
module.exports.deleteGame = function deleteGame(req, res, next) {
    logger.info('Deactivating the game with id:' + Util.getPathParams(req)[2]);
    Game.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                active: false
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedGame) {
            if (err)
                return next(err.message);
            else {
                logger.debug("Deactivated game object: \n" + updatedGame);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedGame || {}, null, 2));
            }
        });
};

//Path: GET api/games/{userId}/getUserGames
module.exports.getUserGames = function getUserGames(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the games for which user with id:' + Util.getPathParams(req)[2] + ' has at last a registered player account ');

    //get the playerAccounts for the given user
    PlayerAccount.find({
        user: Util.getPathParams(req)[2]
    })
        .populate("game")
        .exec(function (err, playerAccountList) {
                if (err)
                    return next(err.message);

                logger.debug(playerAccountList);
                if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(playerAccountList || {}, null, 2);
                }
                else {
                    //get the games related to these playerAccounts and retrieve only the game properties (gameId, gameName)
                    var userGames = _.uniq(_.map(playerAccountList, function (playerAccount) {
                        return playerAccount._doc.game._doc;
                    }));

                    res.set('Content-Type', 'application/json');
                    res.status(200).end(JSON.stringify(userGames || {}, null, 2));
                }
            }
        );
};