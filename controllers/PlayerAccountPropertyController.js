/**
 * Created by Antoine on 06/01/2017.
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
    playerAccountPropertyService = require('../services/PlayerAccountPropertyService');

mongoose.Promise = Promise;

//Path: GET api/playerAccountProperties/properties
/**
 * @description Route permettant de récupérer toutes les propriétés de tous les playerAccounts de la base
 * @param req
 * @param res
 * @param next
 */
module.exports.getPlayerAccountsProperties = function getPlayerAccountsProperties(req, res, next) {
    logger.info('Getting all playerAccounts properties from db...');

    PlayerAccountProperty.find({})
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperties || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperties || {}, null, 2));
            }
        });
};

//Path: GET api/playerAccountProperties/{playerAccountPropertyId}
/**
 * @description Route permettant de récupérer la playerAccountProperty spécifiée par son playerAccountPropertyId
 * @param req
 * @param res
 * @param next
 */
module.exports.getPlayerAccountPropertyById = function getPlayerAccountPropertyById(req, res, next) {
    logger.info('Getting the playerAccount property with given id: ' + Util.getPathParams(req)[3] + ' from db...');

    PlayerAccountProperty.findOne({_id: Util.getPathParams(req)[2]})
        .populate("playerAccount")
        .exec(function (err, playerAccountProperty) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperty) || _.isEmpty(playerAccountProperty)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperty || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperty || {}, null, 2));
            }
        });
};

//Path: GET api/playerAccountProperties/propertiesByKey/{key}
/**
 * @description Route permettant de récupérer toutes les propriétés ayant pour nom/clé la key passée en paramètre
 * de tous les playerAccounts de la base
 * @param req
 *      - key
 * @param res
 * @param next
 */
module.exports.getPlayerAccountsPropertiesByKey = function getPlayerAccountsPropertiesByKey(req, res, next) {
    logger.info('Getting all playerAccounts properties with key ' + decodeURIComponent(Util.getPathParams(req)[3]) + 'from db...');

    PlayerAccountProperty.find({
        key: decodeURIComponent(Util.getPathParams(req)[3])
    })
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperties || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperties || {}, null, 2));
            }
        });
};

//Path: GET api/playerAccountProperties/propertiesByValue/{value}
/**
 * @description Route permettant de récupérer toutes les propriétés ayant pour valeur la value passée en paramètre
 * de tous les playerAccounts de la base
 * @param req
 *      - key
 * @param res
 * @param next
 */
module.exports.getPlayerAccountsPropertiesByValue = function getPlayerAccountsPropertiesByValue(req, res, next) {
    logger.info('Getting all playerAccounts properties with value ' + decodeURIComponent(Util.getPathParams(req)[3]) + 'from db...');

    PlayerAccountProperty.find({
        value: decodeURIComponent(Util.getPathParams(req)[3])
    })
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperties || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperties || {}, null, 2));
            }
        });
};

//Path: POST api/playerAccountProperties/{playerAccountId}/addProperty
/**
 * @description Route permettant d'ajouter une propriété à un playerAccount
 * @param req:
 *          - playerAccountId
 * @param res
 * @param next
 */
module.exports.addPlayerAccountProperty = function addPlayerAccountProperty(req, res, next) {
    logger.info('Adding new playerAccountProperty to the given playerAccount with ID: ' + Util.getPathParams(req)[2]);

    PlayerAccount.findOne(
        {_id: Util.getPathParams(req)[2]},
        function (err, foundPlayerAccount) {
            if (err) {
                return next(err);
            }
            if (_.isNull(foundPlayerAccount) || _.isEmpty(foundPlayerAccount)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(foundPlayerAccount || {}, null, 2);
            }
            else {
                var playerAccountPropertyToCreate = new PlayerAccountProperty({
                    playerAccount: foundPlayerAccount._id,
                    key: sanitizer.escape(req.body.key),
                    value: sanitizer.escape(req.body.value),
                    active: sanitizer.escape(req.body.active),
                    created_at: moment(),
                    updated_at: moment()
                });

                logger.debug(playerAccountPropertyToCreate);

                playerAccountPropertyToCreate.save(function (err, createdPlayerAccountProperty) {
                    if (err)
                        return next(err);

                    if (_.isNull(createdPlayerAccountProperty) || _.isEmpty(createdPlayerAccountProperty)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(createdPlayerAccountProperty || {}, null, 2);
                    }
                    else {
                        PlayerAccountProperty.findOne(
                            {_id: createdPlayerAccountProperty._id})
                            .populate('playerAccount')
                            .exec(
                                function (err, playerAccountUpdated) {
                                    if (err)
                                        return next(err);

                                    logger.debug(playerAccountUpdated);

                                    if (_.isNull(playerAccountUpdated) || _.isEmpty(playerAccountUpdated)) {
                                        res.set('Content-Type', 'application/json');
                                        res.status(404).json(playerAccountUpdated || {}, null, 2);
                                    }
                                    else {
                                        res.set('Content-Type', 'application/json');
                                        res.status(200).end(JSON.stringify(playerAccountUpdated || {}, null, 2));
                                    }
                                });
                    }
                });
            }
        });
};

//Path GET api/playerAccountProperties/{playerAccountId}/properties
/**
 * @description Route permettant de récupérer toutes les propriétés d'un playerAccount identifié par son playerAccountId passé en paramètre
 * @param req:
 *          - playerAccountId
 * @param res
 * @param next
 */
module.exports.getPlayerAccountProperties = function getPlayerAccountProperties(req, res, next) {
    logger.info('Getting all playerAccount properties of playerAccount with playerAccountId: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.find({playerAccount: Util.getPathParams(req)[2]})
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperties || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperties || {}, null, 2));
            }
        });
};

//Path GET api/playerAccountProperties/{playerAccountId}/propertiesByKey/{key}
/**
 * @description Route permettant de récupérer la ou les propriété(s) existante(s) ayant pour nom le nom passé en paramètre
 * pour le playerAccount identifié par son playerAccountId passé en paramètre
 * @param req:
 *          - playerAccountId
 *          - key
 * @param res
 *      - playerAccountProperty Object
 * @param next
 *      - error if present
 */
module.exports.getPlayerAccountPropertyByKey = function getPlayerAccountPropertyByKey(req, res, next) {
    logger.info('Getting playerAccountProperty with key ' + Util.getPathParams(req)[4] + ' of playerAccount with playerAccountId: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.findOne({
        playerAccount: Util.getPathParams(req)[2],
        key: Util.getPathParams(req)[4]
    })
        .populate("playerAccount")
        .exec(function (err, playerAccountProperty) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperty) || _.isEmpty(playerAccountProperty)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperty || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperty || {}, null, 2));
            }
        });
};

//Path GET api/playerAccountProperties/{playerAccountId}/propertiesByValue/{value}
/**
 * @description Route permettant de récupérer la ou les propriété(s) existante(s) ayant pour valeur la valeur passée en paramètre
 * pour le playerAccount identifié par son playerAccountId passé en paramètre
 * @param req:
 *          - playerAccountId
 *          - value
 * @param res
 *      - array of PlayerAccountProperty
 * @param next
 *      - error if present
 */
module.exports.getPlayerAccountPropertyByValue = function getPlayerAccountPropertyByValue(req, res, next) {
    logger.info('Getting playerAccountProperty with value ' + decodeURIComponent(Util.getPathParams(req)[4]) + ' of playerAccount with playerAccountId: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.find({
        playerAccount: Util.getPathParams(req)[2],
        value: decodeURIComponent(Util.getPathParams(req)[4])
    })
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperties) || _.isEmpty(playerAccountProperties)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperties || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperties || {}, null, 2));
            }
        });
};

//Path GET api/playerAccountProperties/{gameId}
/**
 * @description Route permettant de récupérer les properties des playerAccounts liées à jeu donné
 * @param req
 * @param res
 * @param next
 */
module.exports.getPlayerAccountPropertiesByGameId = function getPlayerAccountPropertiesByGameId(req, res, next) {
    logger.info('Getting playerAccountProperties related to game with id ' + Util.getPathParams(req)[2]);

    playerAccountPropertyService.findByGameId(Util.getPathParams(req)[2], function (err, playerAccountPropertiesList) {
        if (err) {
            return next(err);
        }
        if (_.isNull(playerAccountPropertiesList) || _.isEmpty(playerAccountPropertiesList)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(playerAccountPropertiesList || [], null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(playerAccountPropertiesList || [], null, 2));
        }
    });
};

//Path: PUT api/playerAccountProperties/{playerAccountId}/updateProperty/{key}
/**
 * @description Route permettant de mettre à jour la propriété spécifiée par la key passée en paramètre du playerAccount sépécifié par son id
 * @param req
 *          - playerAccountId
 *          - key
 *          - body: contient la nouvelle valeur à appliquer à la key passée en paramètre
 * @param res
 * @param next
 */
module.exports.updatePlayerAccountProperty = function updatePlayerAccountProperty(req, res, next) {
    logger.info('Updating playerAccountProperty with id: ' + Util.getPathParams(req)[2] + ' and key ' + decodeURIComponent(Util.getPathParams(req)[4]) + ' with value: ' + sanitizer.escape(req.body.value));

    PlayerAccountProperty.findOneAndUpdate(
        {
            playerAccount: Util.getPathParams(req)[2],
            key: decodeURIComponent(Util.getPathParams(req)[4])
        },
        {
            $set: {
                value: sanitizer.escape(req.body.value)
            }
        },
        {new: true})
        .populate("playerAccount")
        .exec(function (err, playerAccountProperty) {
            if (err) {
                return next(err);
            }
            if (_.isNull(playerAccountProperty) || _.isEmpty(playerAccountProperty)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(playerAccountProperty || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(playerAccountProperty || {}, null, 2));
            }
        });
};

//Path: PUT api/playerAccountProperties/{playerAccountPropertyId}
/**
 * @description Route permettant de mettre à jour la propriété spécifiée par son id
 * @param req
 *          - playerAccountPropertyId
 *          - body: contient la nouvelle valeur à appliquer à la key passée en paramètre
 * @param res
 * @param next
 */
module.exports.updatePlayerAccountPropertyById = function updatePlayerAccountPropertyById(req, res, next) {
    logger.info('Updating playerAccountProperty with id: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.findOneAndUpdate(
        {
            _id: Util.getPathParams(req)[2]
        },
        {
            $set: {
                value: sanitizer.escape(req.body.value)
            }
        },
        {new: true})
        .populate("playerAccount")
        .exec(function (err, updatedPlayerAccountProperty) {
            if (err) {
                return next(err);
            }
            if (_.isNull(updatedPlayerAccountProperty) || _.isEmpty(updatedPlayerAccountProperty)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(updatedPlayerAccountProperty || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(updatedPlayerAccountProperty || {}, null, 2));
            }
        });
};

//Path: DELETE api/playerAccountProperties/{playerAccountId}/removeProperty/{key}
/**
 * @description Route permettant de supprimer une playerAccountProperty spécifiée par sa key du playerAccount spécifié par son
 * playerAccountId
 * @param req
 * @param res
 * @param next
 */
module.exports.deletePlayerAccountProperty = function deletePlayerAccountProperty(req, res, next) {
    logger.info('Deleting playerAccountProperty with id: ' + Util.getPathParams(req)[2] + ' and key ' + decodeURIComponent(Util.getPathParams(req)[4]));

    PlayerAccountProperty.findOneAndRemove(
        {
            playerAccount: Util.getPathParams(req)[2],
            key: decodeURIComponent(Util.getPathParams(req)[4])
        },
        {new: false})
        .populate("playerAccount")
        .exec(function (err, removedPlayerAccountProperty) {
            if (err) {
                return next(err);
            }
            if (_.isNull(removedPlayerAccountProperty) || _.isEmpty(removedPlayerAccountProperty)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(removedPlayerAccountProperty || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(removedPlayerAccountProperty || {}, null, 2));
            }
        });
};

//Path: DELETE api/playerAccountProperties/{playerAccounPropertytId}
/**
 * @description Route permettant de supprimer une playerAccountProperty spécifiée par son playerAccountPropertyId
 * @param req
 * @param res
 * @param next
 */
module.exports.deletePlayerAccountPropertyById = function deletePlayerAccountPropertyById(req, res, next) {
    logger.info('Deleting playerAccountProperty with id: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.findOneAndRemove(
        {
            _id: Util.getPathParams(req)[2]
        },
        {new: false})
        .populate("playerAccount")
        .exec(function (err, removedPlayerAccountProperty) {
            if (err) {
                return next(err);
            }
            if (_.isNull(removedPlayerAccountProperty) || _.isEmpty(removedPlayerAccountProperty)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(removedPlayerAccountProperty || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(removedPlayerAccountProperty || {}, null, 2));
            }
        });
};

//done GET playerAccountProperties/properties/ --get all properties of all playerAccounts
//done GET playerAccountProperties/propertiesByValue/{value} --get all properties with the given  value of all playerAccounts
//done GET playerAccountProperties/propertiesByKey/{key} --get all properties with the given key of all playerAccounts

//done GET playerAccountProperties/{playerAccountId}/properties/ --get all properties of a playerAccount
//done GET playerAccountProperties/{playerAccountId}/properties/{key} --get properties of a playerAccount by key
//done GET playerAccountProperties/{playerAccountId}/properties/{value} --get properties of a playerAccount by value

//done POST playerAccountProperties/{playerAccountId}/addproperty/ + body --add property-ies to a playerAccount
//done PUT playerAccountProperties/{playerAccountId}/updateproperty/ + body --updates given property-ies key(s)'s value(s) of a playerAccount
//done DELETE playerAccountProperties/{playerAccountId}/removeProperty/{key} --remove property-ies from a playerAccount

//todo Get api/playerAccountProperties/{gameId}/getProperties -> get all the properties for the given game. We should set a list of properties for each games
