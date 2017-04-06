/**
 * Created by Antoine on 06/04/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TournamentGame = new Schema({
    status:{type: String, required: true},
    number: {type: Number, required: true},
    opponents: {type: Schema.ObjectId, ref: 'Opponent', required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

TournamentGame.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

TournamentGame.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

TournamentGame.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});


exports.TournamentGame = mongoose.model('TournamentGame', TournamentGame);