/**
 * Created by Antoine on 23/02/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamProperty = new Schema({
    key: {type: String, required: true},
    value: {type: String, required: true},
    active: {type: Boolean, required: true, default: true},
    playerAccount: {type: Schema.ObjectId, ref: 'PlayerAccount', required: false},
    team: {type: Schema.ObjectId, ref: 'Team', required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

TeamProperty.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

TeamProperty.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

TeamProperty.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

exports.TeamProperty = mongoose.model('TeamProperty', TeamProperty);