/**
 * Created by Leon on 09/12/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Team = new Schema({
    name: { type: String, required: true },
    tag: { type: String, required: true },
    captain: { type: Schema.ObjectId, ref: 'PlayerAccount', required: true },
    players: { type: [{ type: Schema.ObjectId, ref: 'PlayerAccount'}], required: false },
    invitedPlayers: { type: [{ type: Schema.ObjectId, ref: 'PlayerAccount'}], required: false },
    postulatedPlayers: { type: [{ type: Schema.ObjectId, ref: 'PlayerAccount'}], required: false },
    active: { type: Boolean, required: true },
    game: { type: Schema.ObjectId, ref: 'Game', required: true },
    created_at: { type: Date, required: true, default: new Date() },
    updated_at: { type: Date, required: true, default: new Date() }
});

Team.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

Team.pre('update', function(next){
    this.update({},{ $set: { updated_at: new Date() } });
    next();
});

Team.pre('findOneAndUpdate', function(next){
    this.update({},{ $set: { updated_at: new Date() } });
    next();
});


exports.Team = mongoose.model('Team', Team);