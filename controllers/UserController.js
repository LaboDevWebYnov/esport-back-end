/**
 * Created by Antoine on 15/12/2015.
 */
'use strict';

var config = require('config'),
    logger = require('log4js').getLogger('controller.user'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    emailUtils = require('./utils/emailUtils.js'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    UserDaoUtil = require('../DAO/UserDAO');

//Path: GET api/users
module.exports.getUsers = function getUsers(req, res, next) {
    logger.info('Getting all users from db...');

    //TODO add size param handling => see how to get the query params (using url package ?)
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
                if (err){
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
                    if(config.server.features.email.sendOnUserAdd){
                        logger.debug("sendOnUserAdd config: "+config.server.features.email.sendOnUserAdd);
                        logger.debug("sending email....");
                        //send email
                        emailUtils.dispatchAccountValidationLink(user, function (err, user) {
                            if (err){
                                return next(err.message);
                            }
                            else {
                                res.set('Content-Type', 'application/json');
                                res.status(200).end(JSON.stringify(user || {}, null, 2));
                            }
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
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                birthDate: req.body.birthDate,
                phoneNumber: req.body.phoneNumber,
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
    logger.info('Verifying email '+req.params.email);
    // logger.debug('email:' + req.params.mail);
    var registerErr = null;
    //logger.debug('token:'+securityUtils.getPathParams(req)[3]);

    User.findOne({email: Util.getPathParams(req)[4]}, function (err, user) {
        if (err) throw err;
        else {
            //check if a user with the provided email is in DB
            if (user) {
                var mailgun = new Mailgun({
                    apiKey: 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
                    domain: 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
                });

                var members = [
                    {
                        address: req.body.email
                    }
                ];
                //create a mailing list on Mailgun.com/cp/lists and put its address below
                //add email to validated emails list
                mailgun.lists('accountvalidation@sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org').members().add({
                    members: members,
                    subscribed: true
                }, function (err, body) {
                    logger.debug('Response from Mailgun:' + JSON.stringify(body));
                    if (err) {
                        logger.error('Error while sending confirmation email : '+err);
                        return next(err);
                    }
                    else {
                        User.findOneAndUpdate(
                            {
                                email: req.body.email
                            },
                            {
                                $set: {
                                    verified: true
                                }
                            },
                            {new: true}, //means we want the DB to return the updated document instead of the old one
                            function (err, updatedUser) {
                                if (err){
                                    logger.error('Error while updating user verified attr: '+err);
                                    return next(err);
                                }
                                else {
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
                                }
                            });
                    }
                });
            }
            //no user found in the DB with this email, aborting
            else {
                res.set('Content-Type', 'application/json');
                res.status(401).end(JSON.stringify({error: 'Il n\'y a pas d\'utilisateur avec cet email !'}, null, 2));
            }
        }
    });
};