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
    Game = mongoose.model('Game');

mongoose.Promise = Promise;

//Path: GET api/playerAccountProperties/properties
module.exports.getPlayerAccountsProperties = function getPlayerAccountsProperties(req, res, next) {
    logger.info('Getting all playerAccounts properties from db...');

    PlayerAccountProperty.find({})
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err.message);
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
module.exports.addPlayerAccountProperty = function addPlayerAccountProperty(req, res, next) {
    logger.info('Adding new playerAccountProperty to the given playerAccount with ID: ' + Util.getPathParams(req)[2]);

    PlayerAccount.findOne(
        {_id: Util.getPathParams(req)[2]},
        function (err, foundPlayerAccount) {
            if (err) {
                return next(err.message);
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
                        return next(err.message);

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
                                        return next(err.message);

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
module.exports.getPlayerAccountProperties = function getPlayerAccountProperties(req, res, next) {
    logger.info('Getting all playerAccount properties of playerAccount with playerAccountId: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.find({playerAccount: Util.getPathParams(req)[2]})
        .populate("playerAccount")
        .exec(function (err, playerAccountProperties) {
            if (err) {
                return next(err.message);
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

//Path GET api/playerAccountProperties/{playerAccountId}/properties/{key}
module.exports.getPlayerAccountProperty = function getPlayerAccountProperty(req, res, next) {
    logger.info('Getting playerAccountProperty ' + Util.getPathParams(req)[4] + ' of playerAccount with playerAccountId: ' + Util.getPathParams(req)[2]);

    PlayerAccountProperty.findOne({
        playerAccount: Util.getPathParams(req)[2],
        key: Util.getPathParams(req)[4]
    })
    .populate("playerAccount")
    .exec(function (err, playerAccountProperty) {
        if (err) {
            return next(err.message);
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
//done GET playerAccountProperties/properties/ --get all properties of all playerAccounts
//done GET playerAccountProperties/{playerAccountId}/properties/ --get all properties of a playerAccount
//done GET playerAccountProperties/{playerAccountId}/properties/{key} --get properties of a playerAccount by key
//todo GET playerAccountProperties/{playerAccountId}/properties/{value} --get properties of a playerAccount by value

//done POST playerAccountProperties/{playerAccountId}/addproperty/ + body --add property-ies to a playerAccount
//todo PUT playerAccountProperties/{playerAccountId}/updateproperty/ + body --updates given property-ies key(s)'s value(s) of a playerAccount
//todo DELETE playerAccountProperties/{playerAccountId}/removeProperty/{key} --remove property-ies from a playerAccount