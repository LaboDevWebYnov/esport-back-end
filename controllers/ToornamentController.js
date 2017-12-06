var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.toornament'),
    mongoose = require('mongoose'),
    GameDB = require('../models/GameDB'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    Game = mongoose.model('Game'),
    PlayerAccountDB = require('../models/PlayerAccountDB'),
    PlayerAccount = mongoose.model('PlayerAccount');
    toornamentService = require('../services/ToornamentService');

mongoose.Promise = Promise;


// OAUTH
module.exports.getAuthToken = function getAuthToken(req, res, next) {
    logger.info("Getting a token for authenticated toornament's request");

    toornamentService.oauth2(function(err, token){
        if (err) {
            return next(err);
        }
        else if (_.isNull(token) || _.isEmpty(token)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(token || {}, null, 2);
        }
        else {
            logger.debug(token);
            res.set('Content-Type', 'application/json');
            res.status(200).json(token || {}, null, 2);
        }
    });
};


// TOURNAMENT

//Path: GET api/getTournaments
module.exports.getTournaments = function getTournaments(req, res, next) {
    logger.info('Getting All Tournaments from Toornament API...');


    var discipline;
    var status;
    var featured;
    var online;
    var country;
    var afterStart;
    var beforeStart;
    var afterEnd;
    var beforeEnd;
    var sort;
    var name;

    var params = [];


    if(req.query.discipline){
        discipline = req.query.discipline;
        params['discipline'] = discipline;
    }
    if(req.query.status){
        status = req.query.status;
        params['status'] = status;
    }
    if(req.query.featured){
        featured = req.query.featured;
        params['featured'] = featured;
    }
    if(req.query.online){
        online = req.query.online;
        params['online'] = online;
    }
    if(req.query.country){
        country = req.query.country;
        params['country'] = country;
    }
    if(req.query.after_start){
        afterStart = req.query.after_start;
        params[after_start] = afterStart;
    }
    if(req.query.before_start){
        beforeStart = req.query.before_start;
        params['before_start'] = beforeStart;
    }
    if(req.query.after_end){
        afterEnd = req.query.after_end;
        params['after_end'] = afterEnd;
    }
    if(req.query.before_end){
        beforeEnd = req.query.before_end;
        params['before_end'] = beforeEnd;
    }
    if(req.query.sort){
        sort = req.query.sort;
        params['sort'] = sort;
    }
    if(req.query.name){
        name = req.query.name;
        params['name'] = name;
    }


    toornamentService.getTournaments(params,function(err, tournaments){
        if (err) {
            return next(err);
        }
        else if (_.isNull(tournaments) || _.isEmpty(tournaments)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(tournaments || {}, null, 2);
        }
        else {
            logger.debug(tournaments);
            res.set('Content-Type', 'application/json');
            res.status(200).json(tournaments || {}, null, 2);
        }
    });


};

module.exports.getOneTournamentById = function getOneTournamentById(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);

    toornamentService.getOneTournamentById(idTournament ,function(err, tournament){
        if (err) {
            return next(err);
        }
        else if (_.isNull(tournament) || _.isEmpty(tournament)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(tournament || {}, null, 2);
        }
        else {
            logger.debug(tournament);
            res.set('Content-Type', 'application/json');
            res.status(200).json(tournament || {}, null, 2);
        }
    });
};

module.exports.getMyTournaments = function getMyTournaments(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var accessToken;

    var name;
    var discipline;
    var status;
    var archived;
    var online;
    var country;
    var afterStart;
    var beforeStart;
    var afterEnd;
    var beforeEnd;
    var sort;
    var page;

    var params = [];

    if(req.query.name){
        name = req.query.name;
        params['name'] = name;
    }
    if(req.query.discipline){
        discipline = req.query.discipline;
        params['discipline'] = discipline;
    }
    if(req.query.status){
        status = req.query.status;
        params['status'] = status;
    }
    if(req.query.archived){
        archived = req.query.archived;
        params['archived'] = archived;
    }
    if(req.query.online){
        online = req.query.online;
        params['online'] = online;
    }
    if(req.query.country){
        country = req.query.country;
        params['country'] = country;
    }
    if(req.query.after_start){
        afterStart = req.query.after_start;
        params[after_start] = afterStart;
    }
    if(req.query.before_start){
        beforeStart = req.query.before_start;
        params['before_start'] = beforeStart;
    }
    if(req.query.after_end){
        afterEnd = req.query.after_end;
        params['after_end'] = afterEnd;
    }
    if(req.query.before_end){
        beforeEnd = req.query.before_end;
        params['before_end'] = beforeEnd;
    }
    if(req.query.sort){
        sort = req.query.sort;
        params['sort'] = sort;
    }
    if(req.query.page){
        page = req.query.page;
        params['page'] = page;
    }
    if(req.headers.Authorization){
        accessToken = req.headers.Authorization;
        params['access_token'] = accessToken;
    }

    logger.info(params);

    toornamentService.getMyTournaments(params, function(err, tournament){
        if (err) {
            return next(err);
        }
        else if (_.isNull(tournament) || _.isEmpty(tournament)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(tournament || {}, null, 2);
        }
        else {
            logger.debug(tournament);
            res.set('Content-Type', 'application/json');
            res.status(200).json(tournament || {}, null, 2);
        }
    });
};

// MATCHES

module.exports.getMyTournaments = function getMyTournaments(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var hasResult;
    var stageNumber;
    var groupNumber;
    var roundNumber;
    var sort;
    var participantId;
    var withGames;
    var page;

    var params = [];

    if(req.query.has_result){
        hasResult = req.query.has_result;
        params['has_result'] = hasResult;
    }
    if(req.query.stage_number){
        stageNumber = req.query.stage_number;
        params['stage_number'] = stageNumber;
    }
    if(req.query.group_number){
        groupNumber = req.query.group_number;
        params['group_number'] = groupNumber;
    }
    if(req.query.round_number){
        roundNumber = req.query.round_number;
        params['round_number'] = roundNumber;
    }
    if(req.query.sort){
        sort = req.query.sort;
        params['sort'] = sort;
    }
    if(req.query.participant_id){
        participantId = req.query.participant_id;
        params['participant_id'] = participantId;
    }
    if(req.query.with_games){
        withGames = req.query.with_games;
        params['with_games'] = withGames;
    }
    if(req.query.page){
        page = req.query.page;
        params['page'] = page;
    }

    logger.info(params);

    toornamentService.getMyTournaments(params, function(err, tournament){
        if (err) {
            return next(err);
        }
        else if (_.isNull(tournament) || _.isEmpty(tournament)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(tournament || {}, null, 2);
        }
        else {
            logger.debug(tournament);
            res.set('Content-Type', 'application/json');
            res.status(200).json(tournament || {}, null, 2);
        }
    });
};


module.exports.getMatchesByDiscipline = function getMyTournaments(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var disciplineId;
    var featured;
    var hasResult;
    var sort;
    var participantId;
    var tournamentIds;
    var withGames;
    var beforeDate;
    var afterDate;
    var page;

    var params = [];

    if(req.query.after_date){
        hasResult = req.query.after_date;
        params['after_date'] = afterDate;
    }
    if(req.query.before_date){
        hasResult = req.query.before_date;
        params['before_date'] = beforeDate;
    }
    if(req.query.tournament_ids){
        hasResult = req.query.tournament_ids;
        params['tournament_ids'] = tournamentIds;
    }
    if(req.query.featured){
        hasResult = req.query.featured;
        params['featured'] = featured;
    }
    if(req.query.discipline_id){
        hasResult = req.query.discipline_id;
        params['discipline_id'] = disciplineId;
    }
    if(req.query.has_result){
        hasResult = req.query.has_result;
        params['has_result'] = hasResult;
    }
    if(req.query.sort){
        sort = req.query.sort;
        params['sort'] = sort;
    }
    if(req.query.participant_id){
        participantId = req.query.participant_id;
        params['participant_id'] = participantId;
    }
    if(req.query.with_games){
        withGames = req.query.with_games;
        params['with_games'] = withGames;
    }
    if(req.query.page){
        page = req.query.page;
        params['page'] = page;
    }

    var id = decodeURIComponent(Util.getPathParams(req[3]))

    logger.info(params);

    toornamentService.getMatchesByDiscipline(id, params, function(err, tournament){
        if (err) {
            return next(err);
        }
        else if (_.isNull(tournament) || _.isEmpty(tournament)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(tournament || {}, null, 2);
        }
        else {
            logger.debug(tournament);
            res.set('Content-Type', 'application/json');
            res.status(200).json(tournament || {}, null, 2);
        }
    });
};

