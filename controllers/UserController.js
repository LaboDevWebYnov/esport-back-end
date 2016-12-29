/**
 * Created by Antoine on 15/12/2015.
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

//Path: GET api/users
module.exports.getUsers = function getUsers(req, res, next) {
    logger.info('Getting all users from db...');

    //TODO add size param handling => see how to get the query params (using url package)
    // Code necessary to consume the User API and respond
    User.find({})
        .populate('address')
        .exec(function (err, users) {
            if (err)
                return next(err.message);

            if (_.isNull(users) || _.isEmpty(users)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify({error: "Couldn't gets users"}, null, 2));
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(users || {}, null, 2));
            }
        });
};

//Path: GET api/users/addUser
module.exports.addUser = function addUser(req, res, next) {
    logger.info('Adding new user...');
    //check if email isn't already taken
    UserDaoUtil.alreadyTakenEmail(req, function (err, isAlreadyTakenEmail) {
        if (!isAlreadyTakenEmail) {
            //TODO check password difficulty(later)
            //TODO check phone number(later)
            var user = new User({
                firstname: sanitizer.escape(req.body.firstname),
                lastname: sanitizer.escape(req.body.lastname),
                username: sanitizer.escape(req.body.username),
                birthDate: sanitizer.escape(req.body.birthDate),
                email: sanitizer.escape(req.body.email),
                password: sanitizer.escape(req.body.password),
                address: [],
                phoneNumber: sanitizer.escape(req.body.phoneNumber),
                friends: []
            });

            user.save(function (err, user) {
                if (err) {
                    logger.error("got an error while creating user: ", err);
                    return next(err.message);
                }

                if (_.isNull(user) || _.isEmpty(user)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(JSON.stringify('Error while creating user' || {}, null, 2));
                }
                //user saved, now sending email
                else {
                    //if email sendOnUserAdd activated in config, sending account validation email
                    if (config.server.features.email.sendOnUserAdd) {
                        logger.debug("sendOnUserAdd config: " + config.server.features.email.sendOnUserAdd);
                        logger.debug("sending email....");

                        var mailOpts = {
                            protocol: req.protocol,
                            host: req.hostname,
                            port: config.server.instance.port
                        };

                        require('crypto').randomBytes(48, function (err, buffer) {
                            var token = buffer.toString('hex');

                            //send email
                            emailUtils.dispatchAccountValidationLink(mailOpts, user, token, function (err, user) {
                                if (err) {
                                    return next(err.message);
                                }
                                else {
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(user || {}, null, 2));
                                }
                            });
                        });
                    }
                    else {//else returning user directly
                        res.set('Content-Type', 'application/json');
                        res.status(200).end(JSON.stringify(user || {}, null, 2));
                    }
                }
            });
        }
        else {
            res.set('Content-Type', 'application/json');
            res.status(401).end(JSON.stringify({error: 'Email already used'} || {}, null, 2));
        }
    });
};

// Path: GET api/users/{userId}/getUserById
module.exports.getUserById = function getUserById(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the user with id:' + Util.getPathParams(req)[2]);
    // Code necessary to consume the User API and respond

    User.findById(Util.getPathParams(req)[2])
        .populate('address')
        .exec(function (err, user) {
            if (err)
                return next(err.message);
            if (_.isNull(user) || _.isEmpty(user)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify(user || {}, null, 2));
            }
            else {
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(user || {}, null, 2));
            }
        });
};

// Path: GET api/users/{username}/getUserByUsername
module.exports.getUserByUsername = function getUserByUsername(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the user with username:' + Util.getPathParams(req)[4]);
    // Code necessary to consume the User API and respond

    User.findOne({username: Util.getPathParams(req)[2]})
        .populate('address')
        .exec(function (err, user) {
            if (err)
                return next(err.message);

            if (_.isNull(user) || _.isEmpty(user)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify(user || {}, null, 2));
            }
            else {
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(user || {}, null, 2));
            }
        });
};

// Path: PUT api/users/{userId}/updateUser
module.exports.updateUser = function updateUser(req, res, next) {
    User.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                //TODO add phone number check
                firstname: req.body.firstname || null,
                lastname: req.body.lastname || null,
                username: req.body.username || null,
                birthDate: req.body.birthDate || null,
                phoneNumber: req.body.phoneNumber || null,
                updated_at: Date.now()
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedUser) {
            if (err)
                return next(err.message);

            logger.debug("Updated game object: \n" + updatedUser);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));

        });
};

// Path : PUT /users/{userId}/updatePassword
module.exports.updatePassword = function updatePassword(req, res, next) {
    logger.info('Updating password for user with id:\n ' + Util.getPathParams(req)[2]);

    var userOldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var newPasswordConfirmation = req.body.newPasswordConfirmation;
    logger.debug('userPassword object:' + userOldPassword);
    logger.debug('newPassword object:' + newPassword);

    User.findById(
        Util.getPathParams(req)[2],
        function (err, user) {
            if (err)
                return next(err.message);

            // test for a matching password
            user.comparePassword(userOldPassword, function (err, isMatch) {
                if (err) return next(err);

                // check if the password was a match
                if (isMatch) {
                    //logger.debug('It\'s a match !');
                    if (newPassword === newPasswordConfirmation) {
                        user.saltPassword(newPassword, function (err, saltedNewPassword) {
                            logger.debug('saltedNewPassword:' + saltedNewPassword);
                            user.update({
                                $set: {password: saltedNewPassword}
                            }, function (err, raw) {
                                if (err) return next(err.message);
                                res.set('Content-Type', 'application/json');
                                res.status(200).end(JSON.stringify(raw || {}, null, 2));
                            });
                        });
                    }
                    else {
                        res.set('Content-Type', 'application/json');
                        res.status(401).end(JSON.stringify({error: 'New passwords aren\'t the same'}, null, 2));
                    }
                }
                else {//no match
                    res.set('Content-Type', 'application/json');
                    res.status(401).end(JSON.stringify({error: 'Bad old password'}, null, 2));
                }
            });
        });
};

// Path: PUT api/users/{userId}/updateEmail
module.exports.updateEmail = function updateEmail(req, res, next) {
    User.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                //TODO Check that it won't set not updated attributes to 'null'
                //TODO check email regex ?
                email: req.body.email,
                updated_at: Date.now()
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedUser) {
            if (err)
                return next(err.message);

            logger.debug("Updated game object: \n" + updatedUser);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));

        });
};


// Path : PUT api/users/{userId}/deleteUser
module.exports.deleteUser = function deleteUser(req, res, next) {
    logger.info('Deactivating for user with id:\n ' + Util.getPathParams(req)[2]);
    User.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                active: false
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedUser) {
            if (err) {
                return next(err.message);
            }
            else {
                logger.debug("Deactivated game object: \n" + updatedUser);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
            }
        });
};

// Path : GET api/user/verify/{email}
module.exports.verifyUserEmail = function verifyUserEmail(req, res, next) {
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
            //check if a user with the provided email is in DB
            if (user.length) {
                var members = [
                    {
                        address: email
                    }
                ];
                //create a mailing list on mailgun.com/cp/lists and put its address below
                //add email to validated emails list
                mailgun.lists('accountvalidation@sandboxac05877c9fb5494eabcee21e7eaafd61.mailgun.org').members().add({
                    members: members,
                    subscribed: true
                }, function (err, body) {
                    logger.debug('Response from mailgun:' + JSON.stringify(body));
                    if (err) {
                        logger.error('Error while registering user to email validated list : ' + err);
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
                                    accVerifyToken: '',
                                    accVerifyTokenExpires: ''
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

//todo see w/ @TDoret si on fait ça coté front ou back ? ==> front à mon avis + spécifier dans le mail de signup l'adresse du client et non celle du serveur
//todo le client fera le call à l'api et gère le retour du serveur de la step 0
// Path : GET api/register/step0/{email}
module.exports.registerUserEmail = function registerUserEmail(req, res, next) {
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

//Path: POST api/users/signUp
module.exports.signUp = function signUp(req, res, next) {
    logger.info('Adding new user...');
    //check if email isn't already taken
    UserDaoUtil.alreadyTakenEmail(req, function (err, isAlreadyTakenEmail) {
            if (!isAlreadyTakenEmail) {
                //regexp to verify email validity
                var emailPattern = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/ig);
                //todo for tests purposes, add smthg in the config to enable email regexp or not
                if (emailPattern.test(sanitizer.escape(req.body.email))) {
                    require('crypto').randomBytes(48, function (err, buffer) {
                        var token = buffer.toString('hex');
                        var user = new User({
                            email: sanitizer.escape(req.body.email),
                            accValidationToken: token,
                            accValidationTokenExpires: moment().add(2, 'h')
                        });

                        user.save(function (err, user) {
                            if (err) {
                                logger.error("got an error while creating user: ", err);
                                return next(err.message);
                            }

                            if (_.isNull(user._doc) || _.isEmpty(user._doc)) {
                                res.set('Content-Type', 'application/json');
                                res.status(404).json(JSON.stringify('Error while creating user' || {}, null, 2));
                            }
                            //user saved, now sending email
                            else {
                                //if email sendOnUserAdd activated in config, sending account validation email
                                if (config.server.features.email.sendOnUserAdd) {
                                    logger.debug("sendOnUserAdd config: " + config.server.features.email.sendOnUserAdd);
                                    logger.debug("sending email....");

                                    var mailOpts = {
                                        protocol: req.protocol,
                                        host: req.hostname,
                                        port: config.server.instance.port
                                    };

                                    //send email
                                    emailUtils.dispatchAccountValidationLink(mailOpts, user, token, function (err, user) {
                                        if (err) {
                                            return next(err.message);
                                        }
                                        else {
                                            delete user._doc.accValidationTokenExpires;
                                            delete user._doc.accValidationToken;
                                            res.set('Content-Type', 'application/json');
                                            res.status(200).end(JSON.stringify(user._doc || {}, null, 2));
                                        }
                                    });
                                }
                                else {//else returning user directly
                                    delete user._doc.accValidationTokenExpires;
                                    delete user._doc.accValidationToken;
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