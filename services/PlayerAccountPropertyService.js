/**
 * Created by Antoine on 02/02/2017.
 */
var Promise = require("bluebird"),
    logger = require('log4js').getLogger('service.playerAccountProperty'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
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
const CSGOProps = ['current_rank', 'fav_map', 'highest_rank', 'fav_weapon', 'adr', 'kdr'];

//LoL: todo add corresponding props
const LOLProps = [];

//Rocket League: todo add corresponding props
const RLprops = [];

//Dota 2: todo add corresponding props
const DOTA2props = [];

//OverWatch todo add corresponding props
const OWprops = [];

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
            if (_.isNull(foundGame) || _.isEmpty(foundGame)) {
                return next({error: {code: 'E_GAME_NOT_FOUND', message: 'Game with given id not found'}});
            }
            else {
                var gameName = _.toLower(foundGame._doc.name.replace(/\s/g, ""));
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