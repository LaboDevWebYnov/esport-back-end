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

    teamPropertyService.updateTeamPropertyById(Util.getPathParams(req)[2], sanitizer.escape(req.body.value), function (err, updatedTeamProperty) {
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
module.exports.getTeamPropertiesByTeamId = function getTeamPropertiesByTeamId(req, res, next) {
    logger.info('Getting the team properties for team with id: ' + Util.getPathParams(req)[2] + ' from db...');

    teamPropertyService.getTeamPropertiesByTeamId(Util.getPathParams(req)[2], function (err, foundTeamProperties) {
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

    teamPropertyService.getTeamPropertiesByKey(decodeURIComponent(Util.getPathParams(req)[3]), function (err, foundTeamsProperties) {
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

//Path GET api/teamProperties/propertiesByValue/{value}
/**
 * @description Route permettant de récupérer toutes les propriétés ayant pour value la value passée en paramètre
 * de tous les playerAccounts de la base
 * @param req:
 *          - value
 * @param res
 *      - array of TeamProperty
 * @param next
 *      - error if present
 */
module.exports.getTeamsPropertiesByValue = function getTeamsPropertiesByValue(req, res, next) {
    logger.info('Getting all team properties with value ' + decodeURIComponent(Util.getPathParams(req)[3]));

    teamPropertyService.getTeamsPropertiesByValue(decodeURIComponent(Util.getPathParams(req)[3]), function (err, foundTeamsProperties) {
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

//Path: POST api/teamProperties/{teamId}/addProperty
/**
 * @description Route permettant d'ajouter une propriété à une team
 * @param req:
 *          - teamId
 * @param res
 * @param next
 */
module.exports.addTeamProperty = function addTeamProperty(req, res, next) {
    logger.info('Adding new teamProperty to the given team with ID: ' + Util.getPathParams(req)[2]);

    teamPropertyService.addTeamProperty(Util.getPathParams(req)[2], req, function (err, createdTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNil(createdTeamProperty) || _.isEmpty(createdTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(createdTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(createdTeamProperty || {}, null, 2));
        }
    });
};

//Path GET teamProperties/{teamId}/properties/{key}
/**
 * @description Route permettant de récupérer la ou les propriété(s) existante(s) ayant pour nom le nom passé en paramètre
 * pour la team identifiée par son teamId passé en paramètre
 * @param req:
 *          - teamId
 *          - key
 * @param res
 *      - teamProperty Object
 * @param next
 *      - error if present
 */
module.exports.getTeamPropertyByKey = function getTeamPropertyByKey(req, res, next) {
    logger.info('Getting teamProperty with key ' + decodeURIComponent(Util.getPathParams(req)[4]) + ' of team with teamId: ' + Util.getPathParams(req)[2]);

    teamPropertyService.getTeamPropertyByKey(Util.getPathParams(req)[2], decodeURIComponent(Util.getPathParams(req)[4]), function (err, createdTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNil(createdTeamProperty) || _.isEmpty(createdTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(createdTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(createdTeamProperty || {}, null, 2));
        }
    });
};

//Path GET teamProperties/{teamId}/properties/{value}
/**
 * @description Route permettant de récupérer la ou les propriété(s) existante(s) ayant pour nom le nom passé en paramètre
 * pour la team identifiée par son teamId passé en paramètre
 * @param req:
 *          - teamId
 *          - value
 * @param res
 *      - teamProperty Object
 * @param next
 *      - error if present
 */
module.exports.getTeamPropertyByValue = function getTeamPropertyByValue(req, res, next) {
    logger.info('Getting teamProperty with value ' + decodeURIComponent(Util.getPathParams(req)[4]) + ' of team with teamId: ' + Util.getPathParams(req)[2]);

    teamPropertyService.getTeamPropertyByValue(Util.getPathParams(req)[2], decodeURIComponent(Util.getPathParams(req)[4]), function (err, createdTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNil(createdTeamProperty) || _.isEmpty(createdTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(createdTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(createdTeamProperty || {}, null, 2));
        }
    });
};

//Path GET api/teamProperties/{gameId}
/**
 * @description Route permettant de récupérer les properties des teams liées à jeu donné
 * @param req
 * @param res
 * @param next
 */
module.exports.getTeamPropertiesByGameId = function getTeamPropertiesByGameId(req, res, next) {
    logger.info('Getting teamProperties related to game with id ' + Util.getPathParams(req)[2]);

    teamPropertyService.findByGameId(Util.getPathParams(req)[2], function (err, teamPropertiesList) {
        if (err) {
            return next(err);
        }
        if (_.isNull(teamPropertiesList) || _.isEmpty(teamPropertiesList)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(teamPropertiesList || [], null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(teamPropertiesList || [], null, 2));
        }
    });
};

//PAth: PUT teamProperties/{teamId}/updateProperty/{key}
/**
 * @description Route permettant de mettre à jour la propriété spécifiée par la key passée en paramètre de la team sépécifiée par son teamId
 * @param req
 *          - teamId
 *          - key
 *          - body: contient la nouvelle valeur à appliquer à la key passée en paramètre
 * @param res
 * @param next
 */
module.exports.updateTeamProperty = function updateTeamProperty(req, res, next) {
    logger.info('Updating teamProperty with id: ' + Util.getPathParams(req)[2] + ' and key ' + decodeURIComponent(Util.getPathParams(req)[4]) + ' with value: ' + sanitizer.escape(req.body.value));

    teamPropertyService.updateTeamProperty(Util.getPathParams(req)[2], decodeURIComponent(Util.getPathParams(req)[4]), req, function (err, updatedTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNil(updatedTeamProperty) || _.isEmpty(updatedTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(updatedTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(updatedTeamProperty || {}, null, 2));
        }
    });
};

//Path: DELETE api/teamProperties/{teamId}/removeProperty/{key}
/**
 * @description Route permettant de supprimer une teamProperty spécifiée par sa key de la team spécifiée par son
 * teamId
 * @param req
 * - key
 * @param res
 * @param next
 */
module.exports.deleteTeamProperty = function deleteTeamProperty(req, res, next) {
    logger.info('Deleting teamProperty with id: ' + Util.getPathParams(req)[2] + ' and key ' + decodeURIComponent(Util.getPathParams(req)[4]));

    teamPropertyService.deleteTeamProperty(Util.getPathParams(req)[2], decodeURIComponent(Util.getPathParams(req)[4]), function (err, removedTeamProperty) {
        if (err) {
            return next(err);
        }
        if (_.isNil(removedTeamProperty) || _.isEmpty(removedTeamProperty)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(removedTeamProperty || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(removedTeamProperty || {}, null, 2));
        }
    });
};

//done GET teams/properties/ --properties of all teams
//done GET teamProperties/{teamId}/properties/ --properties of a team
//done GET teamProperties/{teamId}/properties/{key} --properties of a team by key
//done GET teamProperties/{teamId}/properties/{value} --properties of a team by value

//done GET teamProperties/propertiesByValue/{value} --get all properties with the given  value of all teams
//done GET teamProperties/propertiesByKey/{key} --get all properties with the given key of all teams
//done GET api/teamProperty/{teamPropertyId} - get the given teamProperty based on its _id

//done POST teamProperties/{teamId}/addproperty/ + body --add property-ies to a team

//done PUT teamProperties/{teamId}/updateproperty/ + body --updates given property-ies key(s)'s value(s) of a team
//done PUT api/teamProperty/{teamPropertyId} - update the given teamProperty based on its _id

//done DELETE api/teamProperty/{teamPropertyId} - delete the given teamProperty based on its _id
//done DELETE teamProperties/{teamId}/removeProperty/{key} --remove property-ies from a team

//todo Get api/teamProperties/{gameId}/getProperties - > get all the properties for the given game. We should set a list of properties for each games