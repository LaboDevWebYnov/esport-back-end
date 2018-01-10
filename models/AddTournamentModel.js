var method = AddTournamentModel.prototype;

function AddTournamentModel(discipline, name, size, participant_type) {

    this.discipline = discipline;
    this.name = name;
    this.size = size;
    this.participant_type =participant_type;
}

module.exports = AddTournamentModel;
