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
            if(err)
                return next(err, null);
            else {
                next(null, playerAccountProperties)
            }
        });
};


//done findAll
//todo findOnePropByKey
//todo findOnePropByValue
//todo findOnePropById
//todo updatePropByKey
//todo updatePropById
//todo deletePropByKey
//todo deletePropById

