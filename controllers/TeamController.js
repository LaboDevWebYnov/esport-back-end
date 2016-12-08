/**
 * Created by Thomas on 13/04/2016.
 */
'use strict';

var logger = require('log4js').getLogger('controller.Games'),
		mongoose = require('mongoose'),
		sanitizer = require('sanitizer'),
		_ = require('lodash'),
		Util = require('./utils/util.js');

var PlayerAccountBD = require('../models/PlayerAccountDB'),
		gameDB = require('../models/GameDB'),
		teamDB = require('../models/TeamDB'),

		PlayerAccount = mongoose.model('PlayerAccount'),
		Game = mongoose.model('Game'),
		Team = mongoose.model('Team');

//Path: GET api/teams
module.exports.getTeams = function getTeams(req, res, next) {
		logger.info('Getting all teams from db...');
		// Code necessary to consume the Game API and respond
		Team.find({}, function (err, teams) {
				if (err) {
						return next(err.message);
				}
				if (_.isNull(teams) || _.isEmpty(teams)) {
						res.set('Content-Type', 'application/json');
						res.status(404).json(JSON.stringify(teams || {}, null, 2));
				}
				else {
						res.set('Content-Type', 'application/json');
						res.end(JSON.stringify(teams || {}, null, 2));
				}
		});
};

//Path: GET api/team/{playerAccountId}/addTeam/{gameId}
module.exports.addTeam = function addTeam(req, res, next) {
		logger.info('Adding new team...');
		// Code necessary to consume the Team API and respond
		PlayerAccount.findOne(
				{_id: Util.getPathParams(req)[2]},
				function (err, PlayerAccountFinded) {
						Game.findOne(
								{_id: Util.getPathParams(req)[4]},
								function (err, gameFinded) {

										//TODO Check that it won't set not updated attributes to 'null'
										var team = new Team({
												name: sanitizer.escape(req.body.teamName),
												tag: sanitizer.escape(req.body.teamTag),
												captain: PlayerAccountFinded,
												players: null,
												invitedPlayers: null,
												postulatedPlayers: null,
												active: true,
												game: gameFinded,
												created_at: Date.now(),
												updated_at: Date.now()
										});

										team.save(function (err, team) {
												if (err)
														return next(err.message);

												if (_.isNull(team) || _.isEmpty(team)) {
														res.set('Content-Type', 'application/json');
														res.status(404).json(JSON.stringify(team || {}, null, 2));
												}
												else {
														res.set('Content-Type', 'application/json');
														res.end(JSON.stringify(team || {}, null, 2));
												}
										});
								});
				});
};

// Path: GET api/team/{teamId}/getTeamById
module.exports.getTeamById = function getTeamById(req, res, next) {
		logger.debug('BaseUrl:' + req.originalUrl);
		logger.debug('Path:' + req.path);

		logger.info('Getting the game with id:' + Util.getPathParams(req)[3]);
		// Code necessary to consume the Team API and respond

		Team.findById(
				Util.getPathParams(req)[2],
				function (err, team) {
						if (err)
								return next(err.message);

						logger.debug(team);
						if (_.isNull(team) || _.isEmpty(team)) {
								res.set('Content-Type', 'application/json');
								res.status(404).json(JSON.stringify(team || {}, null, 2));
						}
						else {
								res.set('Content-Type', 'application/json');
								res.end(JSON.stringify(team || {}, null, 2));
						}
				}
		);
};

// Path: GET api/games/{teamName}/getTeamByName
module.exports.getTeamByName = function getTeamByName(req, res, next) {
		logger.debug('BaseUrl:' + req.originalUrl);
		logger.debug('Path:' + req.path);

		logger.info('Getting the team with name:' + Util.getPathParams(req)[3]);
		// Code necessary to consume the Team API and respond

		Team.findOne(
				{name: Util.getPathParams(req)[2]},
				function (err, team) {
						if (err)
								return next(err.message);

						logger.debug(team);

						if (_.isNull(team) || _.isEmpty(team)) {
								res.set('Content-Type', 'application/json');
								res.status(404).json(JSON.stringify(team || {}, null, 2));
						}
						else {
								res.set('Content-Type', 'application/json');
								res.status(200).end(JSON.stringify(team || {}, null, 2));
						}
				}
		);
};

// Path: PUT api/team/{teamId}/updateTeam/
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
								return next(err.message);

						logger.debug("Updated team object: \n" + updatedTeam);
						res.set('Content-Type', 'application/json');
						res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
				});
};

// Path: PUT api/team/deleteTeam/{teamId}
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
								return next(err.message);

						logger.debug("Deactivated team object: \n" + updatedTeam);
						res.set('Content-Type', 'application/json');
						res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));

				});
};