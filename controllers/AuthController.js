/**
 * Created by Antoine on 02/03/2016.
 */
'use strict';

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.auth'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    token = require('../security/token'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address');

mongoose.Promise = Promise;

// Path : POST /users/auth
module.exports.authenticate = function authenticate(req, res, next) {

    //logger.info(req.body);
    var body = JSON.parse(req.body.body);

    logger.info('Authenticating user with login: ' + body.login);

    var login = body.login;
    var password = body.password;

    User.getAuthenticated(login, password,
        function (err, user) {
            if (err)
                return next(err);

            if (_.isNull(user) || _.isEmpty(user)) {
                res.set('Content-Type', 'application/json');
                //Todo separate to be able to determine wether it's 404 because no user was corresponding or 401 cos bad credentials
                res.status(401).json({
                        error: {
                            errorCode: 'E_INVALID_CREDENTIALS',
                            errorMessage: 'Invalid username or password.'
                        }
                    } || {}, null, 2);
            }
            else {
                //TODO create token and insert it in req header ?
                logger.info('Creating user token for: ', user.username);
                var tokenObject = token.createBasicToken(user._id, user.username, user.firstname, user.lastname);
                token.setResponseToken(tokenObject, res);
                var authResponse = {
                    userId: tokenObject.userId,
                    username: tokenObject.username,
                    firstname: tokenObject.firstname,
                    lastname: tokenObject.lastname,
                    expirationDate: tokenObject.expirationDate
                };
                //res.json(authResponse);
                // logger.info('authResponse object created: \n' + JSON.stringify(authResponse));
                // logger.info('user object created: \n' + user);
                res.set('Content-Type', 'application/json');
                res.status(200).json(authResponse || {}, null, 2);
            }
        });
};