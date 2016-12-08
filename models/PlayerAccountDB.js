/**
 * Created by Leon on 09/12/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerAccount = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: false },
    login: { type: String, required: true },
    game: { type: Schema.ObjectId, ref: 'Game', required: false },
    active: { type: Boolean, required: true, default: true },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() }
});

PlayerAccount.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

PlayerAccount.pre('update', function(next){
    this.update({},{ $set: { updated_at: new Date() } });
    next();
});

PlayerAccount.pre('findOneAndUpdate', function(next){
    this.update({},{ $set: { updated_at: new Date() } });
    next();
});

exports.PlayerAccount = mongoose.model('PlayerAccount', PlayerAccount);