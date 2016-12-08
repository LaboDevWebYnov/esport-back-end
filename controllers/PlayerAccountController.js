/**
 * Created by Ezehollar on 14/01/2016.
 */

var logger = require('log4js').getLogger('controller.playerAccount'),
		mongoose = require('mongoose'),
		sanitizer = require('sanitizer'),
		_ = require('lodash'),
		Util = require('./utils/util.js'),
		PlayerAccountDB = require('../models/PlayerAccountDB'),
		UserDB = require('../models/UserDB'),
		User = mongoose.model('User'),
		PlayerAccount = mongoose.model('PlayerAccount'),
		AddressDB = require('../models/AddressDB'),
		Address = mongoose.model('Address'),
		UserDB = require('../models/UserDB'),
		User = mongoose.model('User'),
		GameDB = require('../models/GameDB'),
		Game = mongoose.model('Game');

//Path: GET api/players
module.exports.getPlayerAccountList = function getPlayerAccountList(req, res, next) {
		logger.info('Getting all players from db...');
		// Code necessary to consume the User API and respond
		PlayerAccount.find({})
		.populate("game user")
		.exec(function (err, playerAccountList) {
				if (err) {
						return next(err.message);
				}
				if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
						res.set('Content-Type', 'application/json');
						res.status(404).json(JSON.stringify(playerAccountList || {}, null, 2));
				}
				else {
						res.set('Content-Type', 'application/json');
						res.end(JSON.stringify(playerAccountList || {}, null, 2));
				}
		});
};

//Path: GET api/playerAccount/{userId}/addPlayerAccount/{gameId}
module.exports.addPlayerAccount = function addPlayerAccount(req, res, next) {
		logger.info('Adding new playerAccount...');

		User.findOne(
				{_id: Util.getPathParams(req)[2]},
				function (err, userFinded) {

						Game.findOne(
								{_id: Util.getPathParams(req)[4]},
								function (err, gameFinded) {
										var playerAccountToCreate = new PlayerAccount({
												user: userFinded,
												login: req.body.login,
												game: gameFinded,
												active: true,
												created_at: new Date(),
												updated_at: new Date()
										});

										logger.debug(playerAccountToCreate);

										playerAccountToCreate.save(function (err, playerAccountFinded) {
												if (err)
														return next(err.message);

												PlayerAccount.findOne(
														{_id: playerAccountFinded._id})
												.populate('user game')
												.exec(
														function (err, playedAccountUpdated) {
																if (err)
																		logger.info(err.message);

																logger.debug(playedAccountUpdated);

																if (_.isNull(playedAccountUpdated) || _.isEmpty(playedAccountUpdated)) {
																		res.set('Content-Type', 'application/json');
																		res.status(404).json(JSON.stringify(playedAccountUpdated || {}, null, 2));
																}
																else {
																		res.set('Content-Type', 'application/json');
																		res.status(200).end(JSON.stringify(playedAccountUpdated || {}, null, 2));
																}
														});
										});
								});
				});
};


// Path: GET api/players/{playerAcountId}/getPlayerAccountById
module.exports.getPlayerAccountById = function getPlayerAccountById(req, res, next) {
		logger.debug('BaseUrl:' + req.originalUrl);
		logger.debug('Path:' + req.path);

		logger.info('Getting the player with id:' + Util.getPathParams(req)[1]);
		// Code necessary to consume the User API and respond

		PlayerAccount.findById(
				Util.getPathParams(req)[2])
		.populate("game user")
		.exec(function (err, playerAccount) {
						if (err)
								return next(err.message);

						logger.debug(playerAccount);
						if (_.isNull(playerAccount) || _.isEmpty(playerAccount)) {
								res.set('Content-Type', 'application/json');
								res.status(404).json(JSON.stringify(playerAccount || {}, null, 2));
						}
						else {
								res.set('Content-Type', 'application/json');
								res.status(200).end(JSON.stringify(playerAccount || {}, null, 2));
						}
				}
		);
};

// Path: GET api/players/{userId}/getPlayerByUserId
module.exports.getPlayerAccountByUserId = function getPlayerAccountByUserId(req, res, next) {
		logger.debug('BaseUrl:' + req.originalUrl);
		logger.debug('Path:' + req.path);

		logger.info('Getting the player with id:' + Util.getPathParams(req)[1]);
		// Code necessary to consume the User API and respond

		PlayerAccount.find(
				{user: {_id: Util.getPathParams(req)[2]}})
		.populate("game user")
		.exec(function (err, playerAccountList) {
						if (err)
								return next(err.message);

						logger.debug(playerAccountList);
						if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
								res.set('Content-Type', 'application/json');
								res.status(404).json(JSON.stringify(playerAccountList || {}, null, 2));
						}
						else {
								res.set('Content-Type', 'application/json');
								res.status(200).end(JSON.stringify(playerAccountList || {}, null, 2));
						}
				}
		);
};

// Path: GET api/players/{login}/getPlayerByLogin
module.exports.getPlayerAccountByLogin = function getPlayerAccountByLogin(req, res, next) {
		logger.debug('BaseUrl:' + req.originalUrl);
		logger.debug('Path:' + req.path);
		logger.info('Getting the player with id:' + Util.getPathParams(req)[1]);
		// Code necessary to consume the User API and respond

		PlayerAccount.find(
				{login: Util.getPathParams(req)[2]})
		.populate("game user")
		.exec(function (err, playerAccountList) {
						if (err)
								return next(err.message);

						logger.debug(playerAccountList);
						if (_.isNull(playerAccountList) || _.isEmpty(playerAccountList)) {
								res.set('Content-Type', 'application/json');
								res.status(404).json(JSON.stringify(playerAccountList || {}, null, 2));
						}
						else {
								res.set('Content-Type', 'application/json');
								res.status(200).end(JSON.stringify(playerAccountList || {}, null, 2));
						}
				}
		);
};

// Path : PUT /players/{playerId}/deletePlayer
module.exports.deletePlayerAccount = function deletePlayerAccount(req, res, next) {
		logger.info('Deactivating for player with id:\n ' + Util.getPathParams(req)[2]);
		PlayerAccount.findOneAndUpdate(
				{_id: Util.getPathParams(req)[2]},
				{
						$set: {
								active: false
						}
				},
				{new: true})
		//means we want the DB to return the updated document instead of the old one
		.populate("game user")
		.exec(function (err, updatedPlayerAccount) {
				if (err)
						return next(err.message);

				logger.debug("Deactivated player object: \n" + updatedPlayerAccount);
				res.set('Content-Type', 'application/json');
				res.status(200).end(JSON.stringify(updatedPlayerAccount || {}, null, 2));
		});
};