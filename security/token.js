/**
 * Created by Antoine on 02/03/2016.
 */

var log4js = require('log4js'),
    logger = log4js.getLogger('token.middleware'),
    config = require('config'),
    moment = require('moment'),
    crypt = require('./crypt'),
    express = require('express');

var TOKEN_HEADER_NAME = 'token';

function Token(options) {
    this.expirationDate = options.expirationDate;
    this.username = options.username;
    this.firstname = options.firstname;
    this.lastname = options.lastname;
}

var tokenDuration;

module.exports.initialize = function initialize() {
    var configTokenDuration = config.server.auth.tokenDuration;
    var isConfigValid = !!configTokenDuration;

    if (isConfigValid) {
        try {
            tokenDuration = moment.duration(configTokenDuration.value, configTokenDuration.unit);
            isConfigValid = tokenDuration.asMilliseconds() !== 0;
        } catch (e) {
            isConfigValid = false;
        }
    }

    if (!isConfigValid) {
        logger.warn('Invalid token duration configuration: ' + configTokenDuration);
        tokenDuration = moment.duration(2, 'h');
    }

    logger.info('Token duration set to: ' + tokenDuration.humanize());
};

module.exports.createBasicToken = function createBasicToken(username, firstname, lastname) {
    logger.info('Creating new token with basic information');
    var tkn = {
        expirationDate: '',
        username: username,
        firstname: firstname,
        lastname: lastname
    };

    var token = new Token(tkn);
    logger.info('Created token: ' + JSON.stringify(token));
    renewToken(token);

    return token;
};

module.exports.tokenHandler = function tokenHandler(req, res, next) {
    logger.debug('Handling token: ' + req.query.token + ' or ' + req.header(TOKEN_HEADER_NAME));
    var tokenString = req.header(TOKEN_HEADER_NAME) || req.query.token;

    logger.debug('String token: ' + tokenString);
    logger.debug('Original url: ' + req.originalUrl);

    if (!tokenString) {
        logger.debug('Missing token in request');
        // let those URLs pass without token
        // /api-docs : swagger spec file (JSON)
        // /docs : swagger UI
        if (req.originalUrl === '/api/auth' || req.originalUrl === '/api/user/verify/' || (req.originalUrl.lastIndexOf('/api-docs', 0) >=0) || (req.originalUrl.lastIndexOf('/docs', 0) >=0)) {
            logger.debug('Authorized url w/o token');
            next();
        } else {
            logger.debug('Missing token in request');
            res.status(401).json({err: 'Missing token'});
        }
        return;
    }

    var decryptedTokenString = crypt.decrypt(tokenString);

    var token;
    try {
        token = JSON.parse(decryptedTokenString);
    } catch (e) {
        logger.warn('Failed to parse token', e);
    }

    if (!token) {
        logger.warn('Failed to parse token');
        res.status(401).json({err: 'Invalid token'});
        return;
    }

    if (isTokenExpired(token)) {
        logger.info('Token is expired');
        res.status(401).json({err: 'Expired token'});
        return;
    }

    logger.debug('Request token: ', token);

    if (!isTokenValid(token, res)) {
        res.status(401).end();
    }

    renewToken(token);
    req.token = token;
    exports.setResponseToken(token, res);

    next();
};

function isTokenValid(token) {
    logger.debug('Checking token:' + JSON.stringify(token));
    logger.debug('type of token:' + typeof(token));

    //verify token
    return token.hasOwnProperty('expirationDate', 'username', 'lastname', 'firstname');
}

function isTokenExpired(token) {
    var expirationDate = moment(token.expirationDate);
    if (!expirationDate.isValid()) {
        logger.debug('Expiration date is invalid: ' + token.expirationDate);
        return true;
    }

    if (expirationDate.isBefore(moment())) {
        logger.debug('Token is expired');
        return true;
    }

    return false;
}

module.exports.setResponseToken = function setResponseToken(token, res) {
    var tokenString = JSON.stringify(token);

    res.set(TOKEN_HEADER_NAME, crypt.encrypt(tokenString));
};

function renewToken(token) {
    var newExpirationDate = moment().add(tokenDuration).toISOString();
    logger.debug('Setting new expiration date to: ' + newExpirationDate);
    token.expirationDate = newExpirationDate;
}

module.exports.getToken = function getToken(req) {
    return req.token;
};