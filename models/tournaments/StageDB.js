/**
 * Created by Antoine on 06/04/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stage = new Schema({
    name:{type: String, required: true},
    type:{type: String, required: true},
    size: {type: Number, required: true},
    number: {type: Number, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

Stage.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Stage.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

Stage.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});


exports.Stage = mongoose.model('Stage', Stage);