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

function generateParamTab(req){
    var params = [];

    if(req.query.discipline){
        params['discipline'] = req.query.discipline;
    }
    if(req.query.status){
        params['status'] = req.query.status;
    }
    if(req.query.featured){
        params['featured'] = req.query.featured;
    }
    if(req.query.online){
        params['online'] = req.query.online;
    }
    if(req.query.country){
        params['country'] =  req.query.country;
    }
    if(req.query.after_start){
        params['after_start'] = req.query.after_start;
    }
    if(req.query.before_start){
        params['before_start'] = req.query.before_start;
    }
    if(req.query.after_end){
        params['after_end'] = req.query.after_end;
    }
    if(req.query.before_end){
        params['before_end'] = req.query.before_end;
    }
    if(req.query.sort){
        params['sort'] = req.query.sort;
    }
    if(req.query.name){
        params['name'] = req.query.name;
    }
    if(req.query.archived){
        params['archived'] = req.query.archived;
    }
    if(req.query.page){
        params['page'] = req.query.page;
    }
    if(req.headers.authorization){
        params['access_token'] = req.headers.authorization;
    }
    if(req.query.has_result){
        params['has_result'] = req.query.has_result;
    }
    if(req.query.stage_number){
        params['stage_number'] = req.query.stage_number;
    }
    if(req.query.group_number){
        params['group_number'] = req.query.group_number;
    }
    if(req.query.round_number){
        params['round_number'] = req.query.round_number;
    }
    if(req.query.participant_id){
        params['participant_id'] = req.query.participant_id;
    }
    if(req.query.with_games){
        params['with_games'] = req.query.with_games;
    }
    if(req.query.tournament_ids){
        params['tournament_ids'] = req.query.tournament_ids;
    }
    if(req.query.featured){
        params['featured'] = req.query.featured;
    }
    if(req.query.with_stat){
        params['page'] = req.query.with_stat;
    }

    return params;
}

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

    var params = generateParamTab(req);

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

    var params = generateParamTab(req);

    logger.info("params", params);

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

module.exports.getMatchesByTournament = function getMatchesByTournament(req, res, next) {
    logger.info('Getting matches by tournament id from Toornament API...');

    var params = generateParamTab(req);

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);

    logger.info("params", params);

    toornamentService.getMatchesByTournament(idTournament, params, function(err, matches){
        if (err) {
            return next(err);
        }
        else if (_.isNull(matches) || _.isEmpty(matches)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(matches || {}, null, 2);
        }
        else {
            logger.debug(matches);
            res.set('Content-Type', 'application/json');
            res.status(200).json(matches || {}, null, 2);
        }
    });
};


module.exports.getMatchesByDiscipline = function getMatchesByDiscipline(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var params = generateParamTab(req);

    var id = decodeURIComponent(Util.getPathParams(req)[3]);

    logger.info(params);

    toornamentService.getMatchesByDiscipline(id, params, function(err, matches){
        if (err) {
            return next(err);
        }
        else if (_.isNull(matches) || _.isEmpty(matches)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(matches || {}, null, 2);
        }
        else {
            logger.debug(matches);
            res.set('Content-Type', 'application/json');
            res.status(200).json(matches || {}, null, 2);
        }
    });
};

module.exports.getMatcheByIdAndTournament = function getMatcheByIdAndTournament(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);
    var idMatche = decodeURIComponent(Util.getPathParams(req)[4]);
    toornamentService.getMatcheByIdAndTournament(idTournament, idMatche, [] ,function(err, matches){
        if (err) {
            return next(err);
        }
        else if (_.isNull(matches) || _.isEmpty(matches)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(matches || {}, null, 2);
        }
        else {
            logger.debug(tournament);
            res.set('Content-Type', 'application/json');
            res.status(200).json(matches || {}, null, 2);
        }
    });
};


module.exports.getMatcheResultByIdAndTournament = function getMatcheResultByIdAndTournament(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);
    var idMatche = decodeURIComponent(Util.getPathParams(req)[4]);
    toornamentService.getMatcheResultByIdAndTournament(idTournament, idMatche, [] ,function(err, matches){
        if (err) {
            return next(err);
        }
        else if (_.isNull(matches) || _.isEmpty(matches)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(matches || {}, null, 2);
        }
        else {
            logger.debug(matches);
            res.set('Content-Type', 'application/json');
            res.status(200).json(matches || {}, null, 2);
        }
    });
};

module.exports.getGamesByMatchAndTournament = function getGamesByMatchAndTournament(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);
    var idMatch = decodeURIComponent(Util.getPathParams(req)[4]);
    toornamentService.getGamesByMatchAndTournament(idTournament, idMatch, [] ,function(err, games){
        if (err) {
            return next(err);
        }
        else if (_.isNull(games) || _.isEmpty(games)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(games || {}, null, 2);
        }
        else {
            logger.debug(games);
            res.set('Content-Type', 'application/json');
            res.status(200).json(games || {}, null, 2);
        }
    });
};

module.exports.getGamesByIdAndMatchAndTournament = function getGamesByIdAndMatchAndTournament(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);
    var idMatch = decodeURIComponent(Util.getPathParams(req)[4]);
    var idGame = decodeURIComponent(Util.getPathParams(req)[6]);

    var params = generateParamTab(req);

    toornamentService.getGamesByIdAndMatchAndTournament(idTournament, idMatch, idGame, params ,function(err, games){
        if (err) {
            return next(err);
        }
        else if (_.isNull(games) || _.isEmpty(games)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(games || {}, null, 2);
        }
        else {
            logger.debug(games);
            res.set('Content-Type', 'application/json');
            res.status(200).json(games || {}, null, 2);
        }
    });
};

module.exports.getGamesResultByIdAndMatchAndTournament = function getGamesResultByIdAndMatchAndTournament(req, res, next) {
    logger.info('Getting a Tournament by id from Toornament API...');

    var idTournament = decodeURIComponent(Util.getPathParams(req)[2]);
    var idMatch = decodeURIComponent(Util.getPathParams(req)[4]);
    var idGame = decodeURIComponent(Util.getPathParams(req)[6]);

    var params = generateParamTab(req);

    toornamentService.getGamesResultByIdAndMatchAndTournament(idTournament, idMatch, idGame, params ,function(err, games){
        if (err) {
            return next(err);
        }
        else if (_.isNull(games) || _.isEmpty(games)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(games || {}, null, 2);
        }
        else {
            logger.debug(games);
            res.set('Content-Type', 'application/json');
            res.status(200).json(games || {}, null, 2);
        }
    });
};