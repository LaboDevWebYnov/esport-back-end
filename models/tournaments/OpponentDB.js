/**
 * Created by Antoine on 06/04/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Opponent = new Schema({
    number: {type: Number, required: true},
    participant: {type: Schema.ObjectId, ref: 'Participant', required: true},
    result: {type: Number, required: false},
    rank: {type: Number, required: false},
    score: {type: Number, required: false},
    forfeit: {type: Boolean, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

Opponent.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Opponent.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

Opponent.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});


exports.Opponent = mongoose.model('Opponent', Opponent);