/**
 * Created by Antoine on 23/02/2017.
 */
var Promise = require("bluebird"),
    logger = require('log4js').getLogger('service.teamProperty'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
    Util = require('../controllers/utils/util.js'),
    TeamPropertyDB = require('../models/TeamPropertyDB'),
    TeamDB = require('../models/TeamDB'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    TeamProperty = mongoose.model('TeamProperty'),
    Team = mongoose.model('Team'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    GameDB = require('../models/GameDB'),
    Game = mongoose.model('Game');

mongoose.Promise = Promise;

module.exports.getAllTeamsProperties = function getAllTeamsProperties(next) {
    TeamProperty.find({})
        .populate("playerAccount team")
        .exec(function (err, playerAccountProperties) {
            if (err)
                return next(err, null);
            else {
                next(null, playerAccountProperties)
            }
        });
};

module.exports.getTeamPropertyById = function getTeamPropertyById(teamPropertyId, next) {
    TeamProperty.findOne({_id: teamPropertyId})
        .populate("playerAccount team")
        .exec(function (err, teamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                next(null, teamProperty);
            }
        });
};

module.exports.updateTeamPropertyById = function updateTeamPropertyById(teamPropertyId, value, next) {
    TeamProperty.findOneAndUpdate(
        {
            _id: teamPropertyId
        },
        {
            $set: {
                value: value
            }
        },
        {new: true})
        .populate("playerAccount team")
        .exec(function (err, updatedTeamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                next(null, updatedTeamProperty);
            }
        });
};

module.exports.deleteTeamPropertyById = function deleteTeamPropertyById(teamPropertyId, next) {
    TeamProperty.findOneAndRemove(
        {
            _id: teamPropertyId
        },
        {new: false})
        .populate("playerAccount team")
        .exec(function (err, removedTeamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                next(null, removedTeamProperty);
            }
        });
};

module.exports.getTeamPropertiesByTeamId = function getTeamPropertiesByTeamId(teamId, next) {
    TeamProperty.find({team: teamId})
        .populate("playerAccount team")
        .exec(function (err, teamProperties) {
            if (err) {
                return next(err, null);
            }
            else {
                next(null, teamProperties);
            }
        });
};

module.exports.getTeamPropertiesByKey = function getTeamPropertiesByKey(key, next) {
    TeamProperty.find({
        key: key
    })
        .populate("playerAccount team")
        .exec(function (err, teamsProperties) {
            if (err) {
                return next(err, null);
            }
            else {
                next(null, teamsProperties);
            }
        });
};

module.exports.getTeamsPropertiesByValue = function getTeamsPropertiesByValue(value, next) {
    TeamProperty.find({
        value: value
    })
        .populate("playerAccount team")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err, null);
            }
            else {
                return next(null, playerAccountProperties);
            }
        });
};

module.exports.addTeamProperty = function addTeamProperty(teamId, req, next) {
    Team.findOne(
        {_id: teamId},
        function (err, foundTeam) {
            if (err) {
                return next(err, null);
            }
            if (_.isNil(foundTeam) || _.isEmpty(foundTeam)) {
                return next({status: 404, message: "No team found with this id: " + teamId}, null);
            }
            else {
                let teamPropertyToCreate = new TeamProperty({
                    team: foundTeam._id,
                    key: sanitizer.escape(req.body.key),
                    value: sanitizer.escape(req.body.value),
                    active: sanitizer.escape(req.body.active),
                    playerAccount: sanitizer.escape(req.body.playerAccountId) || undefined,
                    created_at: moment(),
                    updated_at: moment()
                });

                logger.debug(teamPropertyToCreate);

                teamPropertyToCreate.save(function (err, createdTeamProperty) {
                    if (err)
                        return next(err, null);

                    if (_.isNull(createdTeamProperty) || _.isEmpty(createdTeamProperty)) {
                        return next({status: 406, message: "No teamProperty could not be created"}, null);
                    }
                    else {
                        TeamProperty.findOne(
                            {_id: createdTeamProperty._id})
                            .populate('playerAccount')
                            .exec(
                                function (err, teamPropertyUpdated) {
                                    if (err)
                                        return next(err, null);

                                    logger.debug(teamPropertyUpdated);

                                    if (_.isNil(teamPropertyUpdated) || _.isEmpty(teamPropertyUpdated)) {
                                        return next({
                                            status: 404,
                                            message: "No teamProperty found with this id: " + createdTeamProperty._id
                                        }, null);
                                    }
                                    else {
                                        return next(null, teamPropertyUpdated);
                                    }
                                });
                    }
                });
            }
        });
};

module.exports.getTeamPropertyByKey = function getTeamPropertyByKey(teamId, key, next) {
    TeamProperty.findOne({
        team: teamId,
        key: key
    })
        .populate("playerAccount team")
        .exec(function (err, teamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                return next(null, teamProperty);
            }
        });
};

module.exports.getTeamPropertyByValue = function getTeamPropertyByValue(teamId, value, next) {
    TeamProperty.findOne({
        team: teamId,
        value: value
    })
        .populate("playerAccount team")
        .exec(function (err, teamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                return next(null, teamProperty);
            }
        });
};


module.exports.updateTeamProperty = function updateTeamProperty(teamId, key, req, next) {
    TeamProperty.findOneAndUpdate(
        {
            team: teamId,
            key: key
        },
        {
            $set: {
                value: sanitizer.escape(req.body.value)
            }
        },
        {new: true})
        .populate("playerAccount team")
        .exec(function (err, updatedTeamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                return next(null, updatedTeamProperty);
            }
        });
};

module.exports.deleteTeamProperty = function deleteTeamProperty(teamId, key, next) {
    TeamProperty.findOneAndRemove(
        {
            team: teamId,
            key: key
        },
        {new: false})
        .populate("playerAccount team")
        .exec(function (err, removedTeamProperty) {
            if (err) {
                return next(err, null);
            }
            else {
                return next(null, removedTeamProperty);
            }
        });
};

//CS:GO: todo add corresponding props
//todo complete this
const CSGOProps = ['rank', 'kill_death_ratio', 'total_time_played', 'total_mvps', 'ratio_win_loose', 'percentage_kills_by_heads_shot', 'accuracy', 'country', 'name', 'pseudo'];


//LoL: todo add corresponding props
const LOLProps = [];

//Rocket League: todo add corresponding props
const RLprops = [];

//Dota 2: todo add corresponding props
const DOTA2props = [];

//OverWatch todo add corresponding props
const OWprops = [];


/**
 * @description Given a gameId, we retrieve the corresponding keys for the teamProperty
 * @param gameId
 * @param next:
 *      -error le cas échéant
 *      -l'array de props sinon
 */
module.exports.findByGameId = function findByGameId(gameId, next) {
    logger.info("Retrieving team properties for game with id: " + gameId);
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

//done findAll
//done findOnePropByKey
//done findOnePropByValue
//done findOnePropById
//done addProperty
//done updatePropByKey
//done updatePropById
//done deletePropByKey
//done deletePropById
//done findByTeamId
//done getAllByKey
//done getAllByValue

//todo Faire un liste de teamProperty keys par jeu