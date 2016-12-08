/**
 * Created by Leon on 09/12/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game = new Schema({
    name: { type: String, required: true },
    releaseDate: { type: Date, required: true},
    multiPlayer: { type: Boolean, required: true },
    description: { type: String, required: true },
    editor: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() }
});

Game.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

Game.pre('update', function(next){
    this.update({},{ $set: { updated_at: new Date() } });
    next();
});

Game.pre('findOneAndUpdate', function(next){
    this.update({},{ $set: { updated_at: new Date() } });
    next();
});


exports.Game = mongoose.model('Game', Game);