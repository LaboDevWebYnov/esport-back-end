/**
 * Created by Antoine on 26/01/2016.
 */
var logger = require('log4js').getLogger('controller.userAddress'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('../controllers/utils/util.js'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address');

module.exports.createAddress = function createAddress(req,next){
    //create address
    var address = new Address({
        postCode: sanitizer.escape(req.body.postCode),
        city: sanitizer.escape(req.body.city),
        country: sanitizer.escape(req.body.country),
        line: sanitizer.escape(req.body.line)
    });

    address.save(function (err, savedAddress) {
        if (err)
            return next(err.message);

        if (_.isNull(savedAddress) || _.isEmpty(savedAddress)) {
            return next({error:'Bad object from DB for address'},null);
        }
        else {
            //logger.debug('Created address:' + savedAddress);
            return next(null,savedAddress._id);
        }
    });
};

module.exports.getUserAddress = function getUserAddress(req, next){
    User.findById(Util.getPathParams(req)[2],
        function (err, user) {
            if (err)
                return next(err.message);
            if (_.isNull(user) || _.isEmpty(user)) {
                return next({error:'Bad object from DB for address'},null);
            }
            else {
                logger.debug('User address:'+user.address);
                return next(null,user.address);
            }
        });
};

module.exports.updateUserAddressList = function updateUserAddressList(req,address, next){
    User.findOneAndUpdate({_id: Util.getPathParams(req)[2]},
        {
            $set: {
                address: address
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedUser) {
            if (err)
                return next (err.message);
            if (_.isNull(updatedUser) || _.isEmpty(updatedUser)) {
                return next({error:'Bad object user from DB'},null);
            }
            else {
                //logger.debug('Updated user with new addressList', updatedUser);
                return next(null,updatedUser);
            }
        });
};