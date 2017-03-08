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

module.exports.updateTeamPropertyById = function updateTeamPropertyById(teamPropertyId, next) {
    TeamProperty.findOneAndUpdate(
        {
            _id: teamPropertyId
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

module.exports.getTeamPropertiesByValue = function getTeamPropertiesByValue(value, next) {
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
                return next(err);
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
                return next(err);
            }
            else {
                return next(null, teamProperty);
            }
        });
};

//done findAll
//done findOnePropByKey
//done findOnePropByValue
//done findOnePropById
//done addProperty
//todo updatePropByKey
//done updatePropById
//todo deletePropByKey
//done deletePropById
//done findByTeamId
//donegetAllByKey
//done getAllByValue

