/**
 * Created by Antoine on 22/02/2017.
 */
var Promise = require("bluebird"),
    express = require('express'),
    logger = require('log4js').getLogger('service.user'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash');

var PlayerAccountBD = require('../models/PlayerAccountDB'),
    GameDB = require('../models/GameDB'),
    TeamDB = require('../models/TeamDB'),
    UserDB = require('../models/UserDB'),
    gameDB = require('../models/GameDB'),
    teamDB = require('../models/TeamDB'),
    userDB = require('../models/UserDB'),
    RoleDB = require('../models/RoleDB'),

    PlayerAccount = mongoose.model('PlayerAccount'),
    Game = mongoose.model('Game'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    Role = mongoose.model('Role');

mongoose.Promise = Promise;

module.exports.getTeamRoles = function getTeamRoles(teamId, next) {
    Role.find({_id: teamId},
        function (err, roles) {
            if (err)
                return next(err, null);
            if (_.isNil(roles) || _.isEmpty(roles)) {
                return next(null, roles);
            }
            else {
                return next(err, null);
            }
        });
};