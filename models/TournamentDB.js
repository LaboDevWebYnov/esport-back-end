var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Tournament = new Schema({
    id: {type: String, required: true},
    discipline: {type: String, required: true},
    name: {type:String, required: true},
    size: {type: Integer, required: true},
    participant_type: {type: String, required: true},
    full_name: {type: String, required: false},
    organization: {type: String, required: true},
    website: {type: String, required: true},
    date_start: {type: Date, required: false},
    date_end: {type: Date, required: true},
    timezone: {type: String, required: false},
    online: {type: Boolean, required: false},
    public: {type: Boolean, required: true},
    location: {type: String, required: true},
    country: {type: String, required: true},
    description: {type: String, required: true},
    rules: {type: String, required: true},
    prize: {type: String, required: true},
    check_in: {type: Boolean, required: true},
    participant_nationality: {type: Boolean, required: true},
    match_format: {type: String, required: true},
    platforms: {type: [{type: String}], required: true}
});