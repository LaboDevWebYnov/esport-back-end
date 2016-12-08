/**
 * Created by Antoine on 24/01/2016.
 */
var logger = require('log4js').getLogger('controller.userAddress'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    UserAddressDAO = require('../DAO/UserAddressDAO');

//Path : POST /user/{userId}/addresses/addAddress
module.exports.addAddress = function addAddress(req, res, next) {
    logger.info('Adding a new address to the user with id:\n ' + Util.getPathParams(req)[2]);

    UserAddressDAO.createAddress(req, function (err, createdAddress) {
        if (err)
            return next(err.message);
        if (_.isNull(createdAddress) || _.isEmpty(createdAddress)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(JSON.stringify({error: "Couldn't create address"}, null, 2));
        }
        else {
            //logger.debug('Created to insert:' + createdAddress);
            //get user
            //if user address list is null, push createdAddress directly in the user's addresslis
            //else
            UserAddressDAO.getUserAddress(req, function (err, userAddress) {
                if (err)
                    return next(err.message);
                else {
                    logger.debug('User addressList:' + userAddress);
                    //insert new address _id in ObjectId list
                    if(_.isNull(userAddress)){
                        User.findOne({_id: Util.getPathParams(req)[2]},
                        function (err, user) {
                            user.address = [];
                            user.address.push(createdAddress);
                            //logger.debug('New User finalAddressList:' + userAddress);
                            // and update its addressList attribute with new data
                            UserAddressDAO.updateUserAddressList(req, user.address, function (err, updatedUser) {
                                if (err)
                                    throw (err.message);
                                if (_.isNull(updatedUser) || _.isEmpty(updatedUser)) {
                                    res.set('Content-Type', 'application/json');
                                    res.status(404).json(JSON.stringify({error: "Couldn't update address"}, null, 2));
                                }
                                else {
                                    logger.debug('Updated user', updatedUser);
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
                                }
                            });
                        });
                    }
                    else{
                        userAddress.push(createdAddress);
                        //logger.debug('New User finalAddressList:' + userAddress);
                        // and update its addressList attribute with new data
                        UserAddressDAO.updateUserAddressList(req, userAddress, function (err, updatedUser) {
                            if (err)
                                throw (err.message);
                            if (_.isNull(updatedUser) || _.isEmpty(updatedUser)) {
                                res.set('Content-Type', 'application/json');
                                res.status(404).json(JSON.stringify({error: "Couldn't update address"}, null, 2));
                            }
                            else {
                                logger.debug('Updated user', updatedUser);
                                res.set('Content-Type', 'application/json');
                                res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
                            }
                        });
                    }
                }
            });
        }
    });
};

//Path : PUT /addresses/{userId}/updateAddress/{addressId}
module.exports.updateAddress = function updateAddress(req, res, next) {
    logger.info('Updating address with addressId: ' + Util.getPathParams(req)[2] + ' of user with id: ' + Util.getPathParams(req)[4]);
    Address.findOneAndUpdate({_id: Util.getPathParams(req)[4]},
        {
            $set: {
                postCode: sanitizer.escape(req.body.postCode),
                city: sanitizer.escape(req.body.city),
                country: sanitizer.escape(req.body.country),
                line: sanitizer.escape(req.body.line)
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedAddressFromDB) {
            if (err)
                return next(err.message);
            if (_.isNull(updatedAddressFromDB) || _.isEmpty(updatedAddressFromDB)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify({error: "Couldn't update address"}, null, 2));
            }
            else {
                //logger.debug('Updated address', updatedAddressFromDB);
                User.findOne({_id: Util.getPathParams(req)[2]},
                    function (err, updatedUser) {
                        if (err)
                            return next(err.message);

                        if (_.isNull(updatedUser) || _.isEmpty(updatedUser)) {
                            res.set('Content-Type', 'application/json');
                            res.status(404).json(JSON.stringify(updatedUser || {}, null, 2));
                        }
                        else {

                            res.set('Content-Type', 'application/json');
                            res.status(200).end(JSON.stringify(updatedUser || {}, null, 2));
                        }
                    });
            }
        });
};

//Path : GET /addresses/{userId}/getUserAddresses
module.exports.getUserAddresses = function getUserAddresses(req, res, next) {
    logger.info('Getting addresses for user with userId: ' + Util.getPathParams(req)[2]);
    User.findOne({_id: Util.getPathParams(req)[2]})
        .populate('address')
        .exec(function (err, user) {
            if (err)
                return next(err.message);
            if (_.isNull(user) || _.isEmpty(user)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify({error: "Couldn't update address"}, null, 2));
            }
            else {
                //logger.debug('User addresses', user.address);

                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(user.address || {}, null, 2));

            }
        });
};

//Path : GET /addresses/{addressId}/getAddressById
module.exports.getAddressById = function getAddressById(req, res, next) {
    logger.info('Getting address with addressId: ' + Util.getPathParams(req)[2]);
    Address.findById(Util.getPathParams(req)[2], function (err, address) {
        if (err)
            return next(err.message);
        if (_.isNull(address) || _.isEmpty(address)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(JSON.stringify({error: "Couldn't retrieve address"}, null, 2));
        }
        else {
            //logger.debug('Retrieved address', address);

            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(address || {}, null, 2));
        }
    });
};

//Path : PUT /addresses/{addressId}/deactivateAddress
module.exports.deactivateAddress = function deactivateAddress(req, res, next) {
    logger.info('Deactivating address with id:\n ' + Util.getPathParams(req)[2]);
    Address.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                active: false
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, deactivatedAddress) {
            if (err)
                return next(err.message);

            logger.debug("Deactivated game object: \n" + deactivatedAddress);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(deactivatedAddress || {}, null, 2));

        });
};
