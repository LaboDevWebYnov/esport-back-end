/**
 * Created by Ezehollar on 14/01/2016.
 */

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.playerAccount'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    PlayerAccountDB = require('../models/PlayerAccountDB'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    PlayerAccount = mongoose.model('PlayerAccount'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    async = require('async'),
    GameDB = require('../models/GameDB'),
    playerAccountPropertyService = require('../services/PlayerAccountPropertyService'),
    Game = mongoose.model('Game');

mongoose.Promise = Promise;

//Path: GET api/playerAccounts
module.exports.getPlayerAccountList = function getPlayerAccountList(req, res, next) {
    logger.info('Getting all playerAccounts from db...');
    // Code necessary to consume the User API and respond
    PlayerAccount.find({})
        .populate("game user")
        .exec(function (err, playerAccountList) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountList || {}, null, 2);
            }
            else {
                async.filter(playerAccountList,function (playerAccount,cb) {
                    playerAccountPropertyService.getPlayerAccountProperties(playerAccount._id,function (err,playerAccountProperties) {
                        if (err)
                            cb(err);

                        logger.debug(playerAccountProperties);
                        if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                            cb(null);
                            // res.set('Content-Type', 'application/json');
                            // res.status(404).json(playerAccountProperties || {}, null, 2);
                        }
                        else {
                            playerAccount._doc.properties = playerAccountProperties;
                            cb(null);
                        }
                    });
                },function (err,results) {
                    if(err){
                        return next(err);
                    }
                    else{
                        res.set('Content-Type', 'application/json');
                        res.status(200).end(JSON.stringify(playerAccountList || {}, null, 2));
                    }
                } )
            }
        });
};

//Path: POST api/playerAccounts/{userId}/addPlayerAccount/{gameId}
module.exports.addPlayerAccount = function addPlayerAccount(req, res, next) {
    logger.info('Adding new playerAccount...');

    User.findOne(
        {_id: Util.getPathParams(req)[2]},
        function (err, userFinded) {

            Game.findOne(
                {_id: Util.getPathParams(req)[4]},
                function (err, gameFinded) {
                    var playerAccountToCreate = new PlayerAccount({
                        user: userFinded,
                        login: req.body.login,
                        game: gameFinded,
                        active: true,
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    logger.debug(playerAccountToCreate);

                    playerAccountToCreate.save(function (err, playerAccountFinded) {
                        if (err)
                            return next(err);

                        PlayerAccount.findOne(
                            {_id: playerAccountFinded._id})
                            .populate('user game')
                            .exec(
                                function (err, playedAccountUpdated) {
                                    if (err)
                                        return next(err);

                                    logger.debug(playedAccountUpdated);

                                    if (_.isNull(playedAccountUpdated) || _.isEmpty(playedAccountUpdated)) {
                                        res.set('Content-Type', 'application/json');
                                        res.status(404).json(playedAccountUpdated || {}, null, 2);
                                    }
                                    else {
                                        res.set('Content-Type', 'application/json');
                                        res.status(200).end(JSON.stringify(playedAccountUpdated || {}, null, 2));
                                    }
                                });
                    });
                });
        });
};


// Path: GET api/playerAccounts/{playerAcountId}/getPlayerAccountById
module.exports.getPlayerAccountById = function getPlayerAccountById(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the playerAccount with id:' + Util.getPathParams(req)[2]);
    // Code necessary to consume the User API and respond

    PlayerAccount.findById(
        Util.getPathParams(req)[2])
        .populate("game user")
        .exec(function (err, playerAccount) {
                if (err)
                    return next(err);

                logger.debug(playerAccount);
                if (_.isNull(playerAccount) || _.isEmpty(playerAccount)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(playerAccount || {}, null, 2);
                }
                else {
                    playerAccountPropertyService.getPlayerAccountProperties(playerAccount._id,function (err,playerAccountProperties) {
                        if (err)
                            return next(err);

                        logger.debug(playerAccountProperties);
                        if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                            res.set('Content-Type', 'application/json');
                            res.status(404).json(playerAccountProperties || {}, null, 2);
                        }
                        else {
                            playerAccount._doc.properties = playerAccountProperties;
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(playerAccount || {}, null, 2));
                        }
                    });
                }
            }
        );
};

// Path: GET api/playerAccounts/{userId}/getPlayerByUserId
module.exports.getPlayerAccountByUserId = function getPlayerAccountByUserId(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the playerAccount with id:' + Util.getPathParams(req)[2]);
    // Code necessary to consume the User API and respond

    PlayerAccount.find(
        {user: {_id: Util.getPathParams(req)[2]}})
        .populate("game user")
        .exec(function (err, playerAccountList) {
                if (err)
                    return next(err);

                logger.debug(playerAccountList);
                if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(playerAccountList || {}, null, 2);
                }
                else {
                    async.filter(playerAccountList,function (playerAccount,cb) {
                        playerAccountPropertyService.getPlayerAccountProperties(playerAccount._id,function (err,playerAccountProperties) {
                            if (err)
                                cb(err);

                            logger.debug(playerAccountProperties);
                            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                                cb(null);
                                // res.set('Content-Type', 'application/json');
                                // res.status(404).json(playerAccountProperties || {}, null, 2);
                            }
                            else {
                                playerAccount._doc.properties = playerAccountProperties;
                                cb(null);
                            }
                        });
                    },function (err,results) {
                        if(err){
                            return next(err);
                        }
                        else{
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(playerAccountList || {}, null, 2));
                        }
                    } )
                }
            }
        );
};

// Path: GET api/playerAccounts/{login}/getPlayerByLogin
module.exports.getPlayerAccountByLogin = function getPlayerAccountByLogin(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);
    logger.info('Getting the playerAccount with login:' + decodeURIComponent(Util.getPathParams(req)[2]));
    // Code necessary to consume the User API and respond

    PlayerAccount.findOne(
        {login: decodeURIComponent(Util.getPathParams(req)[2])})
        .populate("game user")
        .exec(function (err, playerAccount) {
                if (err)
                    return next(err);

                logger.debug(playerAccount);
                if (_.isNull(playerAccount) || _.isEmpty(playerAccount)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(playerAccount || {}, null, 2);
                }
                else {
                    playerAccountPropertyService.getPlayerAccountProperties(playerAccount._id,function (err,playerAccountProperties) {
                        if (err)
                            return next(err);

                        logger.debug(playerAccountProperties);
                        if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                            res.set('Content-Type', 'application/json');
                            res.status(404).json(playerAccountProperties || {}, null, 2);
                        }
                        else {
                            playerAccount._doc.properties = playerAccountProperties;
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(playerAccount || {}, null, 2));
                        }
                    });
                }
            }
        );
};

// Path : PUT api/playerAccounts/{playerAccountId}/updatePlayerAccount
module.exports.updatePlayerAccount = function updatePlayerAccount(req, res, next) {
    logger.info('updating playerAccount with id:\n ' + Util.getPathParams(req)[2]);
    if (!_.isUndefined(sanitizer.escape(req.body.login)) && !_.isEmpty(sanitizer.escape(req.body.login))) {
        PlayerAccount.findOneAndUpdate(
            {_id: Util.getPathParams(req)[2]},
            {
                $set: {
                    login: sanitizer.escape(req.body.login)
                }
            },
            {new: true})
        //means we want the DB to return the updated document instead of the old one
            .populate("game user")
            .exec(function (err, updatedPlayerAccount) {
                if (err)
                    return next(err);

                if (_.isNull(updatedPlayerAccount) || _.isEmpty(updatedPlayerAccount)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(updatedPlayerAccount || {}, null, 2);
                }

                else {
                    logger.debug("Updated playerAccount object: \n" + updatedPlayerAccount);
                    res.set('Content-Type', 'application/json');
                    res.status(200).end(JSON.stringify(updatedPlayerAccount || {}, null, 2));
                }
            });
    }
    else {
        res.set('Content-Type', 'application/json');
        res.status(400).json({error: 'login param is empty'} || {}, null, 2);
    }
};

// Path : PUT /playerAccounts/{playerAccountId}/deletePlayer
module.exports.deletePlayerAccount = function deletePlayerAccount(req, res, next) {
    logger.info('Deactivating for playerAccount with id:\n ' + Util.getPathParams(req)[2]);
    PlayerAccount.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                active: false
            }
        },
        //means we want the DB to return the updated document instead of the old one
        {new: true})
        .populate("game user")
        .exec(function (err, updatedPlayerAccount) {
            if (err)
                return next(err);

            if (_.isNull(updatedPlayerAccount) || _.isEmpty(updatedPlayerAccount)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(updatedPlayerAccount || {}, null, 2);
            }
            else {
                logger.debug("Deactivated playerAccount object: \n" + updatedPlayerAccount);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedPlayerAccount || {}, null, 2));
            }
        });
};

//Path:  GET api/playerAccounts/{userId}/game/{gameId}
module.exports.getPlayerAccountsByUserAndGame = function getPlayerAccountsByUserAndGame(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);
    logger.info('Getting the playerAccounts for user with id:' + Util.getPathParams(req)[2] + ' and game with game id: ' + Util.getPathParams(req)[4]);

    PlayerAccount.find(
        {
            user: Util.getPathParams(req)[2],
            game: Util.getPathParams(req)[4]
        }
    )
        .populate("game user")
        .exec(function (err, playerAccountList) {
                if (err)
                    return next(err);

                logger.debug(playerAccountList);
                if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(playerAccountList || {}, null, 2);
                }
                else {
                    async.filter(playerAccountList,function (playerAccount,cb) {
                        playerAccountPropertyService.getPlayerAccountProperties(playerAccount._id,function (err,playerAccountProperties) {
                            if (err)
                                cb(err);

                            logger.debug(playerAccountProperties);
                            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                                cb(null);
                                // res.set('Content-Type', 'application/json');
                                // res.status(404).json(playerAccountProperties || {}, null, 2);
                            }
                            else {
                                playerAccount._doc.properties = playerAccountProperties;
                                cb(null);
                            }
                        });
                    },function (err,results) {
                        if(err){
                            return next(err);
                        }
                        else{
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(playerAccountList || {}, null, 2));
                        }
                    } )
                }
            }
        );
};

//Path:  GET api/playerAccounts/game/{gameId}
module.exports.getPlayerAccountsByGame = function getPlayerAccountsByGame(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);
    logger.info('Getting the playerAccounts for game with game id: ' + Util.getPathParams(req)[3]);
    console.log(req);
    PlayerAccount.find(
        {
            game: Util.getPathParams(req)[3]
        }
    )
        .populate("game")
        .exec(function (err, playerAccountList) {
                if (err)
                    return next(err);

                logger.debug(playerAccountList);
                if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(playerAccountList || {}, null, 2);
                }
                else {
                    async.filter(playerAccountList,function (playerAccount,cb) {
                        playerAccountPropertyService.getPlayerAccountProperties(playerAccount._id,function (err,playerAccountProperties) {
                            if (err)
                                cb(err);

                            logger.debug(playerAccountProperties);
                            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                                cb(null);
                                // res.set('Content-Type', 'application/json');
                                // res.status(404).json(playerAccountProperties || {}, null, 2);
                            }
                            else {
                                playerAccount._doc.properties = playerAccountProperties;
                                cb(null);
                            }
                        });
                    },function (err,results) {
                        if(err){
                            return next(err);
                        }
                        else{
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(playerAccountList || {}, null, 2));
                        }
                    } )
                }
            }
        );
};