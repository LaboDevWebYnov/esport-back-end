/**
 * Created by Antoine on 08/01/2016.
 */
'use strict';

var logger = require('log4js').getLogger('controller.Games'),
    mongoose = require('mongoose'),
    gameDB = require('../models/GameDB'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    Game = mongoose.model('Game');

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
            res.status(404).json(JSON.stringify(games || {}, null, 2));
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
            res.status(404).json(JSON.stringify(game || {}, null, 2));
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

    logger.info('Getting the game with id:' + Util.getPathParams(req)[3]);
    // Code necessary to consume the Game API and respond

    Game.findById(
        Util.getPathParams(req)[2],
        function (err, game) {
            if (err)
                return next(err.message);

            logger.debug(game);
            if (_.isNull(game) || _.isEmpty(game)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify(game || {}, null, 2));
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

    logger.info('Getting the game with name:' + Util.getPathParams(req)[3]);
    // Code necessary to consume the Game API and respond

    Game.findOne(
        {name: Util.getPathParams(req)[2]},
        function (err, game) {
            if (err)
                return next(err.message);

            logger.debug(game);

            if (_.isNull(game) || _.isEmpty(game)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify(game || {}, null, 2));
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

    Game.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                //TODO Check that it won't set not updated attributes to 'null'
                name: req.body.name,
                releaseDate: req.body.releaseDate,
                multiPlayer: req.body.multiPlayer,
                description: req.body.description,
                editor: req.body.editor,
                active: req.body.active
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedGame) {
            if (err)
                return next(err.message);

            logger.debug("Updated game object: \n" + updatedGame);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(updatedGame || {}, null, 2));

        });
};

// Path: PUT api/games/deleteGame/{gameId}
module.exports.deleteGame = function deleteGame(req, res, next) {

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

            logger.debug("Deactivated game object: \n" + updatedGame);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(updatedGame || {}, null, 2));

        });
};