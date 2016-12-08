/**
 * Created by Antoine on 25/01/2016.
 */
var logger = require('log4js').getLogger('controller.userAddress'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address');


//Path : GET /addresses/getAddresses
module.exports.getAddresses = function getAddresses(req, res, next) {
    logger.info('Getting all addresses from db...');
    Address.find({})
        .exec(function (err, addresses) {
            if (err)
                return next(err.message);

            if (_.isNull(addresses) || _.isEmpty(addresses)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(JSON.stringify({error: "Couldn't get addresses"}, null, 2));
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(addresses || {}, null, 2));
            }
        });
};