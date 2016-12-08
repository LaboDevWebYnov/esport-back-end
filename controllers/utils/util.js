/**
 * Created by Ezehollar on 08/01/2016.
 */
"use strict";

var url = require('url'),
    express = require('express'),
    logger = require('log4js').getLogger('controller.util');

module.exports.getPathParams = function getPathParams(req){
    return url.parse(req.url).pathname.split('/').slice(1);
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