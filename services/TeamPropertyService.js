/**
 * Created by Antoine on 23/02/2017.
 */
var Promise = require("bluebird"),
    logger = require('log4js').getLogger('service.playerAccountProperty'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    moment = require('moment'),
    _ = require('lodash'),
    Util = require('../controllers/utils/util.js'),
    PlayerAccountPropertyDB = require('../models/PlayerAccountPropertyDB'),
    PlayerAccountDB = require('../models/PlayerAccountDB'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    PlayerAccountProperty = mongoose.model('PlayerAccountProperty'),
    PlayerAccount = mongoose.model('PlayerAccount'),
    AddressDB = require('../models/AddressDB'),
    Address = mongoose.model('Address'),
    GameDB = require('../models/GameDB'),
    Game = mongoose.model('Game');

mongoose.Promise = Promise;

//todo findAllProps
//todo findOnePropByKey
//todo findOnePropByValue
//todo findOnePropById
//todo updatePropByKey
//todo updatePropById
//todo deletePropByKey
//todo deletePropById

