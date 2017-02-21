/**
 * Created by Thomas on 13/04/2016.
 */
'use strict';

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.team'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js');

var PlayerAccountBD = require('../models/PlayerAccountDB'),
    gameDB = require('../models/GameDB'),
    teamDB = require('../models/TeamDB'),
    userDB = require('../models/UserDB'),

    PlayerAccount = mongoose.model('PlayerAccount'),
    Game = mongoose.model('Game'),
    Team = mongoose.model('Team');
    User = mongoose.model('User');

mongoose.Promise = Promise;

//Path: GET api/teams
module.exports.getTeams = function getTeams(req, res, next) {
    logger.info('Getting all teams from db...');
    // Code necessary to consume the Game API and respond
    Team.find({}, function (err, teams) {
        if (err) {
            return next(err);
        }
        if (_.isNull(teams) || _.isEmpty(teams)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(teams || {}, null, 2);
        }
        else {
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(teams || {}, null, 2));
        }
    });
};

//Path: GET api/teams/{playerAccountId}/addTeam/{gameId}
module.exports.addTeam = function addTeam(req, res, next) {
    logger.info('Adding new team...');
    // Code necessary to consume the Team API and respond
    PlayerAccount.findOne(
        {_id: Util.getPathParams(req)[2]},
        function (err, playerAccountFinded) {
            Game.findOne(
                {_id: Util.getPathParams(req)[4]},
                function (err, gameFinded) {

                    //définition d'une team
                    var team = new Team({
                        name: sanitizer.escape(req.body.teamName),
                        tag: sanitizer.escape(req.body.teamTag),
                        captain: playerAccountFinded,
                        players: null,
                        invitedPlayers: null,
                        postulatedPlayers: null,
                        active: true,
                        country: sanitizer.escape(req.body.teamCountry),
                        game: gameFinded,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    });

                    team.save(function (err, team) {
                        if (err)
                            return next(err);

                        if (_.isNull(team) || _.isEmpty(team)) {
                            res.set('Content-Type', 'application/json');
                            res.status(404).json(team || {}, null, 2);
                        }
                        else {
                            res.set('Content-Type', 'application/json');
                            res.end(JSON.stringify(team || {}, null, 2));
                        }
                    });
                });
        });
};

// Path: GET api/teams/{teamId}/getTeamById
module.exports.getTeamById = function getTeamById(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the game with id:' + Util.getPathParams(req)[3]);
    // Code necessary to consume the Team API and respond

    Team.findById(
        Util.getPathParams(req)[2],
        function (err, team) {
            if (err)
                return next(err);

            logger.debug(team);
            if (_.isNull(team) || _.isEmpty(team)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(team || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(team || {}, null, 2));
            }
        }
    );
};

// Path: GET api/teams/{teamName}/getTeamByName
module.exports.getTeamByName = function getTeamByName(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the team with name:' + decodeURIComponent(Util.getPathParams(req)[2]));
    // Code necessary to consume the Team API and respond

    Team.findOne(
        {name: decodeURIComponent(Util.getPathParams(req)[2])},
        function (err, team) {
            if (err)
                return next(err);

            logger.debug(team);

            if (_.isNull(team) || _.isEmpty(team)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(team || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(team || {}, null, 2));
            }
        }
    );
};

// Path: PUT api/teams/{teamId}/updateTeam/
module.exports.updateTeam = function updateTeam(req, res, next) {

    Team.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                //TODO Check that it won't set not updated attributes to 'null'
                name: sanitizer.escape(req.body.teamName),
                tag: sanitizer.escape(req.body.teamTag),
                updated_at: Date.now()
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedTeam) {
            if (err)
                return next(err);

            logger.debug("Updated team object: \n" + updatedTeam);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
        });
};

// Path: PUT api/teams/deleteTeam/{teamId}
module.exports.deleteTeam = function deleteTeam(req, res, next) {

    Team.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {
            $set: {
                active: false
            }
        },
        {new: true}, //means we want the DB to return the updated document instead of the old one
        function (err, updatedTeam) {
            if (err)
                return next(err);

            logger.debug("Deactivated team object: \n" + updatedTeam);
            res.set('Content-Type', 'application/json');
            res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));

        });
};

//Path: GET api/teams/{userId}/games/{gameId}
module.exports.getTeamByUserIdByGameId = function getTeamByUserIdByGameId(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the team with name:' + decodeURIComponent(Util.getPathParams(req)[2]),Util.getPathParams(req)[4]);
    // Code necessary to consume the Team API and respond

    Team.find(
        {game : decodeURIComponent(Util.getPathParams(req)[4])},
        function (err, teams) {
            if (err)
                return next(err);

            logger.debug(teams);

            var tab;

            for(var y=0;y in teams;y++){
                if(teams[y].players.user._id == Util.getPathParams(req)[2]){
                    tab.push(teams[y]);
                }
            }

            if (_.isNull(tab) || _.isEmpty(tab)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(tab || {}, null, 2);
            }
            else {
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(tab || {}, null, 2));
            }
        }
    );
};
