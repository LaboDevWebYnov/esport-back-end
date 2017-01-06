/**
 * Created by Antoine on 06/01/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerAccountProperty = new Schema({
    playerAccount: {type: Schema.ObjectId, ref: 'PlayerAccount', required: true},
    key: {type: String, required: true},
    value: {type: String, required: true},
    active: {type: Boolean, required: true, default: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

PlayerAccountProperty.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

PlayerAccountProperty.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

PlayerAccountProperty.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

exports.PlayerAccountProperty = mongoose.model('PlayerAccountProperty', PlayerAccountProperty);