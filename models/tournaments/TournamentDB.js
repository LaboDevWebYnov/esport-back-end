/**
 * Created by Antoine on 06/04/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Tournament = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    discipline: {type: String, required: true},
    full_name: {type: String, required: true},
    status: {type: String, required: true},
    date_start: {type: Date, required: true, default: new Date()},
    date_end: {type: Date, required: true, default: new Date()},
    online: {type: Boolean, required: true},
    public: {type: Boolean, required: true},
    location: {type: String, required: true},
    country: {type: String, required: true},
    size: {type: Number, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
});

Tournament.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

Tournament.pre('update', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});

Tournament.pre('findOneAndUpdate', function (next) {
    this.update({}, {$set: {updated_at: new Date()}});
    next();
});


exports.Tournament = mongoose.model('Tournament', Tournament);