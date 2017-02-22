/**
 * Created by Antoine on 22/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Role = new Schema({
    role: {type: String, required: true},
    playerAccount: {type: Schema.ObjectId, ref: 'PlayerAccount', required: true},
    team: {type: Schema.ObjectId, ref: 'Team', required: true},
    active: {type: Boolean, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

Role.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Role.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

Role.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

exports.Role = mongoose.model('Role', Role);