/**
 * Created by Antoine on 23/02/2017.
 */
var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.playerAccountProperty'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    PlayerAccountPropertyDB = require('../models/PlayerAccountPropertyDB'),
    PlayerAccountDB = require('../models/PlayerAccountDB'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    PlayerAccountProperty = mongoose.model('PlayerAccountProperty'),
    PlayerAccount = mongoose.model('PlayerAccount'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    GameDB = require('../models/GameDB'),
    Game = mongoose.model('Game'),
    teamPropertyService = require('../services/TeamPropertyService');

mongoose.Promise = Promise;

//Path: GET api/teams/properties
/**
 * @description Route permettant de récupérer toutes les propriétés de toutes les teams de la base
 * @param req
 * @param res
 * @param next
 */
module.exports.getTeamsProperties = function getTeamsProperties(req, res, next) {
    logger.info('Getting all teams properties from db...');

    teamPropertyService.getAllTeamsProperties(function (err, foundTeamsProps) {
        if (err) {
            return next(err);
        }
        if (_.isNil(foundTeamsProps) || _.isEmpty(foundTeamsProps)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(foundTeamsProps || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(foundTeamsProps || {}, null, 2));
        }
    });
};


//done GET teams/properties/ --properties of all teams
//todo GET teams/{teamId}/properties/ --properties of a team
//todo GET teams/{teamId}/properties/{key} --properties of a team by key
//todo GET teams/{teamId}/properties/{value} --properties of a team by value
//todo POST teams/{teamId}/addproperty/ + body --add property-ies to a team
//todo PUT teams/{teamId}/updateproperty/ + body --updates given property-ies key(s)'s value(s) of a team
//todo DELETE teams/{teamId}/removeProperty/{key} --remove property-ies from a team
//todo Faire un liste de property par jeu
//todo Get api/teams/{gameId}/getProperties - > get all the properties for the given game. We should set a list of properties for each games
//todo GET teamProperty/propertiesByValue/{value} --get all properties with the given  value of all teams
//todo GET teamProperty/propertiesByKey/{key} --get all properties with the given key of all teams
//todo GET api/teamProperty/{teamPropertyId} - get the given teamProperty based on its _id
//todo PUT api/teamProperty/{teamPropertyId} - update the given teamProperty based on its _id
//todo DELETE api/teamProperty/{teamPropertyId} - delete the given teamProperty based on its _id
