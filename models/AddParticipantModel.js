var method = AddParticipantModel.prototype;

function AddParticipantModel(name, email, country, lineUp) {

    this.name = name;
    this.email = email;
    this.country = country;
    this.lineUp = lineUp;
}

module.exports = AddParticipantModel;
