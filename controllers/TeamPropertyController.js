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

//Path: GET api/teamProperties
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

//Path: GET api/teamProperties/{teamPropertyId}
/**
 * @description Route permettant de récupérer la teamProperty spécifiée par son teamPropertyId
 * @param req
 * @param res
 * @param next
 */
module.exports.getTeamPropertyById = function getTeamPropertyById(req, res, next) {
    logger.info('Getting the teamProperty property with given id: ' + Util.getPathParams(req)[2] + ' from db...');

    teamPropertyService.getTeamPropertyById(Util.getPathParams(req)[2], function (err, foundTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNull(foundTeamProperty) || _.isEmpty(foundTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(foundTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(foundTeamProperty || {}, null, 2));
        }
    });
};

//Path: PUT api/teamProperties/{teamPropertyId}
/**
 * @description Route permettant de mettre à jour la propriété spécifiée par son id
 * @param req
 *          - teamPropertyId
 *          - body: contient la nouvelle valeur à appliquer à la key passée en paramètre
 * @param res
 * @param next
 */
module.exports.updateTeamPropertyById = function updateTeamPropertyById(req, res, next) {
    logger.info('Updating teamProperty with id: ' + Util.getPathParams(req)[2]);

    teamPropertyService.updateTeamPropertyById(Util.getPathParams(req)[2], function (err, updatedTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNull(updatedTeamProperty) || _.isEmpty(updatedTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(updatedTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(updatedTeamProperty || {}, null, 2));
        }
    });
};

//Path: DELETE api/teamProperties/{teamPropertyId}
/**
 * @description Route permettant de supprimer une teamProperty spécifiée par son teamPropertyId
 * @param req
 * @param res
 * @param next
 */
module.exports.deleteTeamPropertyById = function deleteTeamPropertyById(req, res, next) {
    logger.info('Deleting teamProperty with id: ' + Util.getPathParams(req)[2]);

    teamPropertyService.deleteTeamPropertyById(Util.getPathParams(req)[2], function (err, deletedTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNull(deletedTeamProperty) || _.isEmpty(deletedTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(deletedTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(deletedTeamProperty || {}, null, 2));
        }
    });
};

//PATH GET api/teamProperties/{teamId}
/**
 * @description Route permettant de récupérer les teamProperty de la team par son teamId
 * @param req
 * @param res
 * @param next
 */
module.exports.getTeamPropertyByTeamId = function getTeamPropertyByTeamId(req, res, next) {
    logger.info('Getting the team properties for team with id: ' + Util.getPathParams(req)[2] + ' from db...');

    teamPropertyService.getTeamPropertyByTeamId(Util.getPathParams(req)[2], function (err, foundTeamProperties) {
        if (err) {
            return next(err);
        }
        if (_.isNull(foundTeamProperties) || _.isEmpty(foundTeamProperties)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(foundTeamProperties || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(foundTeamProperties || {}, null, 2));
        }
    });
};

//Path: GET api/teamProperties/propertiesByKey/{key}
/**
 * @description Route permettant de récupérer toutes les propriétés ayant pour nom/clé la key passée en paramètre
 * de toutes les teams de la base
 * @param req
 *      - key
 * @param res
 * @param next
 */
module.exports.getTeamsPropertiesByKey = function getTeamsPropertiesByKey(req, res, next) {
    logger.info('Getting all teams properties with key ' + decodeURIComponent(Util.getPathParams(req)[3]) + 'from db...');

    teamPropertyService.getTeamPropertyByKey(decodeURIComponent(Util.getPathParams(req)[3]), function (err, foundTeamsProperties) {
        if (err) {
            return next(err);
        }
        if (_.isNull(foundTeamsProperties) || _.isEmpty(foundTeamsProperties)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(foundTeamsProperties || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(foundTeamsProperties || {}, null, 2));
        }
    });
};

//done GET teams/properties/ --properties of all teams
//done GET teamProperties/{teamId}/properties/ --properties of a team
//done GET teamProperties/{teamId}/properties/{key} --properties of a team by key
//todo GET teamProperties/{teamId}/properties/{value} --properties of a team by value
//todo POST teamProperties/{teamId}/addproperty/ + body --add property-ies to a team
//todo PUT teamProperties/{teamId}/updateproperty/ + body --updates given property-ies key(s)'s value(s) of a team
//todo DELETE teamProperties/{teamId}/removeProperty/{key} --remove property-ies from a team
//todo Faire un liste de property par jeu
//todo Get api/teamProperties/{gameId}/getProperties - > get all the properties for the given game. We should set a list of properties for each games
//todo GET teamProperties/propertiesByValue/{value} --get all properties with the given  value of all teams
//todo GET teamProperties/propertiesByKey/{key} --get all properties with the given key of all teams
//done GET api/teamProperty/{teamPropertyId} - get the given teamProperty based on its _id
//done PUT api/teamProperty/{teamPropertyId} - update the given teamProperty based on its _id
//done DELETE api/teamProperty/{teamPropertyId} - delete the given teamProperty based on its _id
