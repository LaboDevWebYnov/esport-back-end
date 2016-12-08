/**
 * Created by Antoine on 02/03/2016.
 */
'use strict';

var logger = require('log4js').getLogger('controller.auth'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    token = require('../security/token'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address');

// Path : POST /users/auth
module.exports.authenticate = function authenticate(req, res, next) {
    logger.info('Authenticating user with login: ' + req.body.login);

    var login = req.body.login;
    var password = req.body.password;

    User.getAuthenticated(login, password,
        function (err, user) {
            if (err)
                return next(err.message);

            if (_.isNull(user) || _.isEmpty(user)) {
                res.set('Content-Type', 'application/json');
                //Todo separate to be able to determine wether it's 404 because no user was corresponding or 401 cos bad credentials
                res.status(401).json(JSON.stringify('Invalid credentials' || {}, null, 2));
            }
            else {
                //TODO create token and insert it in req header ?
                logger.info('Creating user token for: ', user.username);
                var tokenObject = token.createBasicToken(user.username, user.firstname, user.lastname);
                token.setResponseToken(tokenObject, res);
                var authResponse = {
                    username: tokenObject.username,
                    firstname: tokenObject.firstname,
                    lastname: tokenObject.lastname,
                    expirationDate: tokenObject.expirationDate
                };
                //res.json(authResponse);
                //logger.info('user object created: \n' + user);
                res.set('Content-Type', 'application/json');
                res.status(200).json(JSON.stringify(authResponse || {}, null, 2));
            }
        });
};