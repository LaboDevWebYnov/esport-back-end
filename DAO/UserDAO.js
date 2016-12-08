/**
 * Created by Antoine on 27/01/2016.
 */
var express = require('express'),
    logger = require('log4js').getLogger('dao.util'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User');

module.exports.alreadyTakenUsername = function alreadyTakenUsername(req,next) {
    User.findOne({username: sanitizer.escape(req.body.username)},
        function (err, user) {
            if (err)
                return next(err.message,null);
            if (_.isNull(user) || _.isEmpty(user)) {
                return next(null,false);
            }
            else {
                return next(null,true);
            }
        });
};

module.exports.alreadyTakenEmail = function alreadyTakenEmail(req,next){
    User.findOne({email: sanitizer.escape(req.body.email)},
        function (err, user) {
            if (err)
                return next(err.message,null);
            if (_.isNull(user) || _.isEmpty(user)) {
                return next(null,false);
            }
            else {
                return next(null,true);
            }
        });
};