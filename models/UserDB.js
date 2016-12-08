/**
 * Created by Leon on 09/12/2015.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var logger = require('log4js').getLogger('Users');
var _ = require('lodash');

var User = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    username: {type: String, required: true},
    birthDate: {type: Date, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    address: {type:[{ type: Schema.ObjectId, ref: 'Address'}], required: false},
    phoneNumber: {type: String, required: true},
    admin: {type: Boolean, required: true, default: false},
    active: {type: Boolean, required: true, default: true},
    friends: {type: [{type: Schema.ObjectId, ref: 'User'}], required: false},
    interests: {type: [{type: Schema.ObjectId, ref: 'Game'}], required: false},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()},
    verified: {type: Boolean, required: true, default: false},
    loginAttempts: {type: Number, required: true, default: 0},
    lockUntil: {type: Number}
});

User.virtual('isLocked').get(function () {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

User.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (user.isModified('password') || user.isNew()) {
        user.saltPassword(user.password, function (err, saltedPw) {
            if (err) return next(err);
            logger.debug('Salting password: '+user.password+' => salted: '+saltedPw);
            user.password = saltedPw;

            //mise à jour élément de controle (Created_at, Updated_at)
            user.updated_at = Date.now;

            if (!user.created_at) {
                user.created_at = Date.now;
            }
            logger.debug('user:'+ user);

            //extract ObjectIds from array of ObjectId
            if(!_.isNull(user.address)&& !_.isEmpty(user.address))
                user.address = user.address.map(function(address) { return address._id; });

           return next();
        });
    }
    else{
        //mis à jour élément de controle (Created_at, Updated_at)
        user.updated_at = Date.now;

        if (!user.created_at) {
            user.created_at = Date.now;
        }

        //extract ObjectIds from array of ObjectId
        if(!_.isNull(user.address)&& !_.isEmpty(user.address))
            user.address = user.address.map(function(address) { return address._id; });
        return next();
    }
});

User.methods.saltPassword = function (password, cb) {
    logger.info('Salting password...');
    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return cb(err);

        // hash the password using our new salt
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) return cb(err);
            // set the hashed password back on our user document
            return cb(null,hash);
        });
    });
};

User.methods.comparePassword = function (candidatePassword, cb) {
    logger.debug('Comparing passwords: |'+candidatePassword+'| from user input and |'+this.password+'| from DB');
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        logger.debug('Ismatch?'+isMatch);
        return cb(null, isMatch);
    });
};

User.methods.incLoginAttempts = function (cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: {loginAttempts: 1},
            $unset: {lockUntil: 1}
        }, cb);
    }
    // otherwise we're incrementing
    var updates = {$inc: {loginAttempts: 1}};
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= 3 && !this.isLocked) {
        updates.$set = {lockUntil: Date.now() + 1};
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference
var reasons = User.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

User.statics.getAuthenticated = function (username, password, cb) {
    this.findOne({email: username}, function (err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function (err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function (err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: {loginAttempts: 0},
                    $unset: {lockUntil: 1}
                };
                return user.update(updates, function (err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function (err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

User.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

User.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

exports.User = mongoose.model('User', User);

