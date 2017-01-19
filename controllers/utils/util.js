/**
 * Created by Ezehollar on 08/01/2016.
 */
"use strict";

var url = require('url'),
    express = require('express'),
    bcrypt = require('bcryptjs'),
    logger = require('log4js').getLogger('controller.utils.util');

module.exports.getPathParams = function getPathParams(req) {
    return url.parse(req.url).pathname.split('/').slice(1);
};

module.exports.saltPassword = function saltPassword(password, cb) {
    logger.info('Salting password...');
    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return cb(err);

        // hash the password using our new salt
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) return cb(err);
            // set the hashed password back on our user document
            return cb(null, hash);
        });
    });
};

//module.exports.getPassword = function getPassword(req, res, next) {
//    logger.info('Getting password from db for user with id:' +    Util.getPathParams(req)[2]);
//
//    return User.findById(
//        getPathParams(req)[2],
//        function (err, user) {
//         if (err)
//          next(err.message);
//
//         logger.debug('password retrieved:' + user.password);
//         //if (!! user.password ||_.isNull(user.password) || _.isEmpty(user.password)) {
//         //    logger.error('No password found :o !');
//         //}
//
//         next(user.password);
//
//        });
// };