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

module.exports.getTeamPropertyByTeamId = function getTeamPropertyByTeamId(teamId, next) {
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

module.exports.getTeamPropertyByKey = function getTeamPropertyByKey(key, next) {
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
//done findAll
//todo findOnePropByKey
//todo findOnePropByValue
//done findOnePropById
//todo updatePropByKey
//done updatePropById
//todo deletePropByKey
//done deletePropById
//done findByTeamId

