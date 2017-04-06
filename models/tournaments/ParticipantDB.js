/**
 * Created by Antoine on 06/04/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Participant = new Schema({
    //todo
    //link with tournament
    number: {type: Number, required: true},
    participant: {type: Schema.ObjectId, ref: 'Participant', required: true},
    result: {type: Number, required: false},
    rank: {type: Number, required: false},
    score: {type: Number, required: false},
    forfeit: {type: Boolean, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

Participant.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Participant.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

Participant.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});


exports.Participant = mongoose.model('Participant', Participant);