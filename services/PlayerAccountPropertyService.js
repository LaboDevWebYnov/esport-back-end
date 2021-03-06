/**
 * Created by Antoine on 02/02/2017.
 */
var Promise = require("bluebird"),
    logger = require('log4js').getLogger('service.playerAccountProperty'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
    async = require('async'),
    Util = require('../controllers/utils/util.js'),
    PlayerAccountPropertyDB = require('../models/PlayerAccountPropertyDB'),
    PlayerAccountDB = require('../models/PlayerAccountDB'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    PlayerAccountProperty = mongoose.model('PlayerAccountProperty'),
    PlayerAccount = mongoose.model('PlayerAccount'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    GameDB = require('../models/GameDB'),
    steamService = require('./games/SteamService'),
    riotService = require('./games/RiotService'),
    owService = require('./games/BlizzardService'),
    rlService = require('../services/games/RocketLeagueService'),
    ubisoftService = require('../services/games/UbisoftService'),
    Game = mongoose.model('Game');

mongoose.Promise = Promise;

//todo findAllProps
//todo findOnePropByKey
//todo findOnePropByValue
//todo findOnePropById
//todo updatePropByKey
//todo updatePropById
//todo deletePropByKey
//todo deletePropById

//CS:GO: todo add corresponding props
const CSGOProps = ['total_kills', 'kill_death_ratio', 'total_time_played', 'total_mvps', 'ratio_win_loose', 'percentage_kills_by_heads_shot', 'accuracy', 'country', 'name', 'pseudo'];


//LoL: todo add corresponding props
const LOLProps = [];

//Rocket League: todo add corresponding props
const RLprops = ["uniqueId", "displayName", "avatar"];

//Dota 2: todo add corresponding props
const DOTA2props = [];

//OverWatch todo add corresponding props
const OWprops = [];

//Rainbow 6 siege todo add corresponding props
const R6props = [];

/**
 * @description Given a gameId, we retrieve the corresponding keys for the playerAccountProperty
 * @param gameId
 * @param next:
 *      -error le cas échéant
 *      -l'array de props sinon
 */
module.exports.findByGameId = function findByGameId(gameId, next) {
    logger.info("Retrieving properties for game with id: " + gameId);
    Game.findOne({_id: gameId})
        .exec(function (err, foundGame) {
            if (err) {
                return next(err, null);
            }
            if (_.isNil(foundGame) || _.isEmpty(foundGame)) {
                return next({error: {code: 'E_GAME_NOT_FOUND', message: 'Game with given id not found'}});
            }
            else {
                let gameName = _.toLower(foundGame._doc.name.replace(/\s/g, ""));
                logger.debug("trying to link corresponding props for the game with name: " + gameName);
                switch (gameName) {
                    case 'counter-strike:globaloffensive':
                        return next(null, CSGOProps);
                        break;
                    case 'leagueoflegends':
                        return next(null, LOLProps);
                        break;
                    case 'rocketleague':
                        return next(null, RLprops);
                        break;
                    case 'dota2':
                        return next(null, DOTA2props);
                        break;
                    case 'overwatch':
                        return next(null, OWprops);
                        break;
                    case 'rainbow6':
                        return next(null, R6props);
                        break;
                    default:
                        //logger.error("Could not find corresponding props for the game name: " + gameName);
                        return next({
                            error: {
                                code: 'E_GAMEPROPS_NOT_FOUND',
                                message: 'Corresponding game properties not found for the retrieved game: ' + gameName
                            }
                        })
                }
            }
        });
};

module.exports.getPlayerAccountProperties = function getPlayerAccountProperties(playerAccountId, next) {
    let playerAccProps = [];
    PlayerAccount.findOne({_id: playerAccountId}, function (err, foundPlayerAccount) {
        let gameId = foundPlayerAccount._doc.game;
        logger.info("Retrieving properties for game with id: " + gameId);
        Game.findOne({_id: gameId})
            .exec(function (err, foundGame) {
                if (err) {
                    return next(err, null);
                }
                if (_.isNil(foundGame) || _.isEmpty(foundGame)) {
                    return next({error: {code: 'E_GAME_NOT_FOUND', message: 'Game with given id not found'}});
                }
                else {
                    let gameName = _.toLower(foundGame._doc.name.replace(/\s/g, ""));
                    logger.debug("trying to link corresponding props for the game with name: " + gameName);
                    switch (gameName) {
                        case 'rainbowsixsiege':
                            getR6Properties(foundPlayerAccount.login, function (err, r6Properties) {
                                if(!err){
                                    console.log('On est bien dans le R6Properties');
                                    playerAccProps.push(r6Properties)
                                    return next(null, _.flatten(playerAccProps));
                                }
                            });
                            break;
                        case 'counterstrikeglobaloffensive':
                            getCSGOProperties(foundPlayerAccount.login, function (err, csgoProperties) {
                                if (!err) {
                                    playerAccProps.push(csgoProperties);
                                    return next(null, _.flatten(playerAccProps));
                                }
                            });
                            break;
                        case 'leagueoflegends':
                            getLOLProperties(foundPlayerAccount.login, function (err, lolProperties) {
                                if (!err) {
                                    playerAccProps.push(lolProperties);
                                    return next(null, _.flatten(playerAccProps));
                                }
                            });
                            break;
                        case 'rocketleague':

                            getRLPropeties(foundPlayerAccount.login, function (err, rlProperties) {
                                playerAccProps.push(rlProperties);
                                return next(null, _.flatten(playerAccProps));
                            });
                            break;
                        case 'dota2':
                            return next(null, playerAccProps);
                            break;
                        case 'overwatch':
                            getOWProperties(foundPlayerAccount.login, function (err, lolProperties) {
                                if (!err) {
                                    playerAccProps.push(lolProperties);
                                    return next(null, _.flatten(playerAccProps));
                                }
                            });
                            break;
                        default:
                            //logger.error("Could not find corresponding props for the game name: " + gameName);
                            return next({
                                error: {
                                    code: 'E_GAMEPROPS_NOT_FOUND',
                                    message: 'Corresponding game properties not found for the retrieved game: ' + gameName
                                }
                            })
                    }
                }
            });
    })
};

function getOWProperties(UserName, callback) {
    let playerAccountPropertiesContent = [];
    async.parallel([
            function (cb) {
                owService.getUserHeroesCompetitiveStats(UserName, function (error, resp, body) {
                    if (!error && !_.isNull(body)) {
                        for (let y = 0; y in body; y++)
                            playerAccountPropertiesContent.push(body[y]);
                    }
                    cb(error, 'recuperation des stats des heros de OW');
                });
            },
            function (cb) {
                owService.getUserProfileStats(UserName, function (error, resp, body) {
                    if (!error && !_.isNull(body)) {
                        for (let y = 0; y in body; y++)
                            playerAccountPropertiesContent.push(body[y]);
                    }
                    cb(error, 'recuperation des infos du user OW');
                });
            }
        ],
        function (err, results) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, playerAccountPropertiesContent);
            }
        });
}

function getCSGOProperties(steamId, callback) {
    let playerAccountPropertiesContent = {};
    async.parallel([
            function (cb) {
                steamService.getUserStatsForCSGO(steamId, function (error, resp, body) {
                    if (!error && !_.isNull(body)) {
                        playerAccountPropertiesContent['stats'] = (body);
                    }
                    cb(error, 'recuperation des stats de csgo');
                });
            },
            function (cb) {
                steamService.getUserInformation(steamId, function (error, resp, body) {
                    if (!error && !_.isNull(body)) {
                        playerAccountPropertiesContent['userInfo'] = (body);
                    }
                    cb(error, 'recuperation des infos du user steam');
                });
            }
        ],
        function (err, results) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, playerAccountPropertiesContent);
            }
        });
}

function getRLPropeties(steamId, callback) {
    let playerAccountPropertiesContent = {};
    let accountId;
    async.parallel([
            function (cb) {
                rlService.getUserRL(steamId, function (error, resp, body) {
                    accountId = body;
                    if (!error && !_.isNull(body)) {
                        playerAccountPropertiesContent['stats'] = (body);
                    }
                    cb(error, 'recuperation des stats de csgo');
                });
            }
        ],
        function (err, results) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, playerAccountPropertiesContent);
            }
        });
    logger.info(accountId);
}

function getLOLProperties(summonerId, callback) {
    let playerAccountPropertiesContent = {};
    // let accountId = '209956745';

    riotService.getUserLol(summonerId, function (error, resp, body) {
        if (!error && !_.isNull(body)) {
            playerAccountPropertiesContent['userInfo'] = (body);
            let tableMatchId = [];
            let accountId = body.accountId;
            let id = body.id;
            let nbMatchInResult = 3;
            riotService.getWinLooseLol(id, function (error, resp, body) {
                if (!error && !_.isNull(body)) {

                    let league = [];
                    playerAccountPropertiesContent['league'] = body;
                }
            });
            riotService.getLastMatchLol(accountId, function (error, resp, body) {
                if (!error && !_.isNull(body)) {

                    let lastMatchs = [];

                    for(i=0;i<nbMatchInResult;i++){
                        let match = body.matches[i];
                        lastMatchs[i] = match;
                        tableMatchId[i] = match.gameId;
                    }
                    playerAccountPropertiesContent['lastMatch'] = lastMatchs;
                    riotService.getMatcheInfo(tableMatchId, accountId, function (error, resp, body) {
                        if (!error && !_.isNull(resp)) {
                            playerAccountPropertiesContent['lastMatchsInfos'] = resp;
                        }
                        callback(null, playerAccountPropertiesContent);
                    })
                }
            });
        }
    });
}

function getR6Properties(username, callback) {
    let playerAccountPropertiesContent = {};
    let accountId;
    async.parallel([
            function (cb) {
                ubisoftService.getR6Stats(username, function (error, resp, body) {
                    accountId = body;
                    if (!error && !_.isNull(body)) {
                        playerAccountPropertiesContent.stats = (body);
                    }
                    cb(error, 'recuperation des stats de rainbow six siege');
                });
            }
        ],
        function (err, results) {
            if (err) {
                callback(err, null);
            }
            else {
                callback(null, playerAccountPropertiesContent);
            }
        });
}