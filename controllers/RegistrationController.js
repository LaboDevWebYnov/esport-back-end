/**
 * Created by Antoine on 05/01/2017.
 */
'use strict';

var Promise = require("bluebird"),
    config = require('config'),
    logger = require('log4js').getLogger('controller.registration'),
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
    UserService = require('../services/UserService');

mongoose.Promise = Promise;

/**
 * @description Route utilisée lors de l'inscription du user: Le user entre son adresse email et clique sur s'inscrire => appel de cette route
 *      Un email contenant un token lui sera envoyé afin que le user puisse vérifier son email et ainsi continuer son inscription
 * @param req
 * @param res - on status 200:
 *                  createdUser object - without
 * @param next - error
 */
//Path: POST api/register
module.exports.registerUser = function registerUser(req, res, next) {
    logger.info('Registering new user...');
    //check if email isn't already taken
    UserService.alreadyTakenEmail(req, function (err, isAlreadyTakenEmail) {
            if (!isAlreadyTakenEmail) {
                //regexp to verify email validity
                var emailPattern = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/ig);
                //todo for tests purposes, add smthg in the config to enable email regexp or not
                if (emailPattern.test(sanitizer.escape(req.body.email))) {
                    require('crypto').randomBytes(48, function (err, buffer) {
                        var token = buffer.toString('hex');
                        var user = new User({
                            email: sanitizer.escape(req.body.email),
                            accRegisterToken: token,
                            accRegisterTokenExpires: moment().add(2, 'h')
                        });

                        user.save(function (err, user) {
                            if (err) {
                                logger.error("got an error while creating user: ", err);
                                return next(err);
                            }

                            if (_.isNull(user._doc) || _.isEmpty(user._doc)) {
                                res.set('Content-Type', 'application/json');
                                res.status(404).json({error: 'Error while creating user'} || {}, null, 2);
                            }
                            //user saved, now sending email
                            else {
                                //if email sendOnUserRegistration activated in config, sending account validation email
                                if (config.server.features.email.sendOnUserRegistration) {
                                    var mailOpts = config.server.features.email.smtp.mailOpts;

                                    logger.debug("sendOnUserRegistration config: " + JSON.stringify(mailOpts));
                                    logger.debug("sending email....");

                                    //send email
                                    emailUtils.dispatchAccountValidationLink(mailOpts, user, token, function (err, user) {
                                        if (err) {
                                            return next(err);
                                        }
                                        else {
                                            delete user._doc.accVerifyTokenExpires;
                                            delete user._doc.accVerifyToken;
                                            res.set('Content-Type', 'application/json');
                                            res.status(200).end(JSON.stringify(user._doc || {}, null, 2));
                                        }
                                    });
                                }
                                else {//else returning user directly
                                    delete user._doc.accVerifyTokenExpires;
                                    delete user._doc.accVerifyToken;
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(user._doc || {}, null, 2));
                                }
                            }
                        });
                    });
                }
                else {
                    res.set('Content-Type', 'application/json');
                    res.status(400).end(JSON.stringify({error: 'Email is not valid'} || {}, null, 2));
                }
            }
            else {
                res.set('Content-Type', 'application/json');
                res.status(401).end(JSON.stringify({error: 'Email already used'} || {}, null, 2));
            }
        }
    );
};

/**
 * @description Route utilisée lors de la step 0 du processus d'inscription permettant de vérifier l'adresse email du user
 *              set the user to verified: true if email exists, and token provided for this email corresponds to DB data
 *              and token expiration date is still valid
 * @param req
 * @param res - on success:
 *                  send http code 200 and updated user
 *               on error:
 *                  send the error
 * @param next - error if it's the case
 */
// Path : GET api/register/{email}/step0
module.exports.registerUserVerifyEmail = function registerUserVerifyEmail(req, res, next) {
    logger.debug('Original url: ' + req.originalUrl);
    logger.debug('email: ' + decodeURIComponent(Util.getPathParams(req)[2]));
    logger.debug('token: ' + req.query.t);
    var email = decodeURIComponent(Util.getPathParams(req)[2]);
    var token = req.query.t;

    //recherche d'un user avec: cet email, le token correspondant et un token ayant une date de fin de validité > now
    User.find({
        email: email,
        accRegisterToken: token,
        accRegisterTokenExpires: {$gt: moment()}
    }, function (err, user) {
        if (err) return next(err);
        else {
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

/**
 * @description Route utilisée lors de la step 1 du processus d'inscription d'un user.
 * Elle permet de prendre en compte les informations de base d'un user après que son email ai été vérifié lors de la step 0
 * @param req - body comprenant les infos du user:
 *                 - firstname: prénom du user
 *                 - lastname: nom du user
 *                 - username: pseudo du user
 *                 - birthDate: date de naissance du user
 *                 - password: mot de passe du user
 *                 - passwordConfirmation: confirmation mot de passe du user
 *                 - phoneNumber: n° de tel mobile du user
 *                 - updated_at: timestamp de màj du user - set to now
 * @param res
 * @param next
 */
//todo add registerToken for security purposes @see with TDoret for front-end refactor
// Path: PUT api/register/{userId}/step1
module.exports.registerUpdateUser = function registerUpdateUser(req, res, next) {
    logger.debug('Going to update registration infos for user ' + Util.getPathParams(req)[2]);

    if (sanitizer.escape(req.body.password) === sanitizer.escape(req.body.passwordConfirmation)) {
        Util.saltPassword(sanitizer.escape(req.body.password), function (err, saltedNewPassword) {
            if (err) return next(err);
            else {
                logger.debug('saltedNewPassword:' + saltedNewPassword);
                User.findOneAndUpdate(
                    {_id: Util.getPathParams(req)[2]},
                    {
                        $set: {
                            //TODO add phone number check
                            firstname: req.body.firstname || null,
                            lastname: req.body.lastname || null,
                            username: req.body.username || null,
                            birthDate: req.body.birthDate || null,
                            password: saltedNewPassword || null,
                            phoneNumber: req.body.phoneNumber || null,
                            updated_at: Date.now()
                        }
                    },
                    {new: true}, //means we want the DB to return the updated document instead of the old one
                    function (err, updatedUser) {
                        if (err)
                            return next(err);
                        else {
                            logger.debug("Updated user object: \n" + updatedUser);
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
                        }
                    });
            }
        });
    }
    else {
        res.set('Content-Type', 'application/json');
        res.status(400).end(JSON.stringify({error: 'Passwords are not the same'} || {}, null, 2));
    }

};

/**
 * @description Route utilisée pour vérifier que
 * @param req
 * @param res
 * @param next
 */
//GET api/register/{email}/isVerified?t=:incomingToken
module.exports.isUserVerified = function isUserVerified(req, res, next) {
    logger.debug('Original url: ' + req.originalUrl);
    logger.debug('email: ' + decodeURIComponent(Util.getPathParams(req)[2]));
    logger.debug('token: ' + req.query.t);
    var token = req.query.t;
    var email = decodeURIComponent(Util.getPathParams(req)[2]);

    //regexp to verify email validity
    var emailPattern = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/ig);
    //todo for tests purposes, add smthg in the config to enable email regexp or not
    if (emailPattern.test(email)) {
        //recherche d'un user avec: cet email
        User.findOne({
            email: email
        }, function (err, user) {
            if (err) return next(err);
            else {
                //check if a user with the provided email is in DB
                if (user) {
                    //check if user is not verified
                    if (!user.verified) {
                        res.set('Content-Type', 'application/json');
                        res.status(200).end(JSON.stringify({
                            verifiedCode: 'E_NOT_VERIFIED',
                            userId: user._id
                        }, null, 2));
                    }
                    //user verified
                    else {
                        //token ne correspond pas à celui passé en param
                        if (user.accRegisterToken != token) {
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify({
                                verifiedCode: 'E_BAD_TOKEN',
                                userId: user._id
                            }, null, 2));
                        }
                        //si date d'expiration dépassée
                        else if (user.accRegisterTokenExpires < moment()) {
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify({
                                verifiedCode: 'E_EXPIRED_TOKEN',
                                userId: user._id
                            }, null, 2));
                        }
                        //sinon c'est bon
                        else {
                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify({
                                    verifiedCode: 'VERIFIED',
                                    userId: user._id
                                } || {}, null, 2));
                        }
                    }
                }
                //no user found in the DB with this email, aborting
                else {
                    res.set('Content-Type', 'application/json');
                    res.status(404).end(JSON.stringify({error: 'User with this email does not exist'}, null, 2));
                }
            }
        });
    }
    else {
        res.set('Content-Type', 'application/json');
        res.status(400).end(JSON.stringify({error: 'Email is not valid'} || {}, null, 2));
    }
};

//PUT api/register/{userId}/completeRegistration?t=incomingToken
module.exports.completeRegistration = function completeRegistration(req, res, next) {
    logger.info('Completing registration for user with id:\n ' + Util.getPathParams(req)[2]);
    logger.debug('registration token: ' + req.query.t);
    var token = req.query.t;

    User.findOneAndUpdate(
        {
            _id: Util.getPathParams(req)[2],
            accRegisterToken: token,
            accRegisterTokenExpires: {$gt: moment()}
        },
        {
            $unset: {
                accRegisterToken: '',
                accRegisterTokenExpires: ''
            }
        })
        .exec(function (err, updatedUser) {
            if (err)
                return next(err);

            if (_.isNull(updatedUser) || _.isEmpty(updatedUser)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json({
                        error: {
                            errorCode: 'E_USER_NOT_FOUND',
                            errorMessage: 'Could not complete user registration, user not found or bad token'
                        }
                    } || {}, null, 2);
            }
            else {
                logger.debug("Updated User object: \n" + updatedUser);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify({successCode: 'USER_REG_COMPLETED'} || {}, null, 2));
            }
        });
};

//DEL api/register/{userId}/cancelRegistration?t=incomingToken
module.exports.cancelRegistration = function cancelRegistration(req, res, next) {
    logger.info('Cancelling registration for user with id:\n ' + Util.getPathParams(req)[2]);
    logger.debug('registration token: ' + req.query.t);
    var token = req.query.t;

    User.findOneAndRemove(
        {
            _id: Util.getPathParams(req)[2],
            accRegisterToken: token,
            accRegisterTokenExpires: {$gt: moment()}
        })
        .exec(function (err, removedUser) {
            if (err)
                return next(err);

            if (_.isNull(removedUser) || _.isEmpty(removedUser)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json({
                        error: {
                            errorCode: 'E_USER_NOT_FOUND',
                            errorMessage: 'Could not cancel user registration, user not found or bad token'
                        }
                    } || {}, null, 2);
            }
            else {
                logger.debug("Removed User object: \n" + removedUser);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify({successCode: 'USER_REG_CANCELLED'} || {}, null, 2));
            }
        });
};