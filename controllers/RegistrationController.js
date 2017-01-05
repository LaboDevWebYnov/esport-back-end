/**
 * Created by Antoine on 05/01/2017.
 */
'use strict';

var config = require('config'),
    logger = require('log4js').getLogger('controller.user'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    emailUtils = require('./utils/emailUtils.js'),
    mailgun = require('mailgun-js')({
        apiKey: config.server.features.email.smtp.mailgun.apiKey,
        domain: config.server.features.email.smtp.mailgun.domain
    }),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    UserDaoUtil = require('../DAO/UserDAO');

// Path : GET api/register/step0/{email}
//todo need to refactor front-end and registration logic
module.exports.registerUserEmail = function registerUserEmail(req, res, next) {
    return res.status(501).end(JSON.stringify('Not implemented yet' || {}, null, 2));

    logger.debug('Original url: ' + req.originalUrl);
    // logger.info('Verifying email '+ decodeURIComponent(req.params.email));
    logger.debug('email: ' + decodeURIComponent(Util.getPathParams(req)[3]));
    logger.debug('token: ' + req.query.t);
    var email = decodeURIComponent(Util.getPathParams(req)[3]);
    var token = req.query.t;

    //recherche d'un user avec: cet email, le token correspondant et un token ayant une date de fin de validité > now
    User.find({
        email: email,
        accValidationToken: token,
        accValidationTokenExpires: {$gt: moment()}
    }, function (err, user) {
        if (err) return next(err);
        else {
            //todo handle redirecting
            //check if a user with the provided email is in DB
            if (user.length) {
                var members = [
                    {
                        address: email
                    }
                ];
                //create a mailing list on mailgun.com/cp/lists and put its address below
                //add email to validated emails list
                mailgun.lists('accountregistration@sandboxac05877c9fb5494eabcee21e7eaafd61.mailgun.org').members().add({
                    members: members,
                    subscribed: true
                }, function (err, body) {
                    logger.debug('Response from mailgun:' + JSON.stringify(body));
                    if (err) {
                        logger.error('Error while registering user to email list: ' + err);
                        return next(err);
                    }
                    else {
                        User.findOneAndUpdate(
                            {
                                email: email
                            },
                            {
                                $set: {
                                    verified: true
                                },
                                $unset: {
                                    accValidationToken: '',
                                    accValidationTokenExpires: ''
                                }
                            },
                            {new: true}, //means we want the DB to return the updated document instead of the old one
                            function (err, updatedUser) {
                                if (err) {
                                    logger.error('Error while updating user verified attr: ' + err);
                                    return next(err);
                                }
                                else {
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(updatedUser._doc || {}, null, 2));
                                    // res.redirect('/register/step1');
                                }
                            });
                    }
                });
            }
            //no user found in the DB with this email, aborting
            else {
                res.set('Content-Type', 'application/json');
                res.status(401).end(JSON.stringify({error: 'Demande de création de compte invalide ou expirée ! Merci de bien vouloir vour réinscrire ici. (lien à mettre)'}, null, 2));
            }
        }
    });
};

// Path: PUT api/register/step1/{userId}
/**
 * @description Used to update user first infos
 * @param req
 * @param res
 * @param next
 */
module.exports.registerUpdateUser = function registerUpdateUser(req, res, next) {
    User.findOneAndUpdate(
        {_id: Util.getPathParams(req)[3]},
        {
            $set: {
                //TODO add phone number check
                //todo check password and password confirmation;
                firstname: req.body.firstname || null,
                lastname: req.body.lastname || null,
                username: req.body.username || null,
                birthDate: req.body.birthDate || null,
                password: req.body.password || null,
                phoneNumber: req.body.phoneNumber || null,
                updated_at: Date.now()
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedUser) {
            if (err)
                return next(err.message);
            else {
                logger.debug("Updated game object: \n" + updatedUser);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
            }
        });
};