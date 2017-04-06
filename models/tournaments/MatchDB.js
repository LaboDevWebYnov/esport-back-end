/**
 * Created by Antoine on 06/04/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Match = new Schema({
    id: {type: String, required: true},
    type: {type: String, required: true},
    discipline: {type: String, required: true},
    status: {type: String, required: true},
    tournament_id: {type: String, required: true},
    number: {type: Number, required: true},
    stage_number: {type: Number, required: true},
    group_number: {type: Number, required: true},
    round_number: {type: Number, required: true},
    date: {type: Date, required: true, default: new Date()},
    timezone: {type: String, required: true},
    match_format: {type: String, required: true},
    opponents: {type: Schema.ObjectId, ref: 'Opponent', required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

Match.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Match.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

Match.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});


exports.Match = mongoose.model('Match', Match);