/**
 * Created by Thomas on 13/04/2016.
 */
'use strict';

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.team'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    roleService = require('../services/RoleService');

var PlayerAccountBD = require('../models/PlayerAccountDB'),
    gameDB = require('../models/GameDB'),
    teamDB = require('../models/TeamDB'),
    userDB = require('../models/UserDB'),

    PlayerAccount = mongoose.model('PlayerAccount'),
    Game = mongoose.model('Game'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User');

mongoose.Promise = Promise;

//Path: GET api/teams
module.exports.getTeams = function getTeams(req, res, next) {
    logger.info('Getting all teams from db...');
    // Code necessary to consume the Game API and respond
    Team.find({})
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, teams) {
            if (err) {
                return next(err);
            }
            if (_.isNull(teams) || _.isEmpty(teams)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(teams || {}, null, 2);
            }
            else {
                //todo ajouter les roles pour chaque team
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(teams || {}, null, 2));
            }
        });
};

//Path: GET api/teams/{userId}/addTeam/{gameId}
module.exports.addTeam = function addTeam(req, res, next) {
    logger.info('Adding new team to game with gameId ' + Util.getPathParams(req)[4] + ' with user ' + Util.getPathParams(req)[2]);

    User.findOne(
        {_id: Util.getPathParams(req)[2]},
        function (err, userFinded) {
            if (err)
                return next(err);
            if (_.isNull(userFinded) || _.isEmpty(userFinded)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(userFinded || {}, null, 2);
            }
            else {
                Game.findOne(
                    {_id: Util.getPathParams(req)[4]},
                    function (err, gameFinded) {
                        if (err)
                            return next(err);
                        if (_.isNull(gameFinded) || _.isEmpty(gameFinded)) {
                            res.set('Content-Type', 'application/json');
                            res.status(404).json(gameFinded || {}, null, 2);
                        }
                        else {
                            //définition d'une team
                            let team = new Team({
                                name: sanitizer.escape(req.body.teamName),
                                tag: sanitizer.escape(req.body.teamTag),
                                owner: userFinded._id,
                                players: sanitizer.escape(req.body.captainPlayerAccountId) || [],
                                captain: sanitizer.escape(req.body.captainPlayerAccountId) || undefined,
                                invitedPlayers: [],
                                postulatedPlayers: [],
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
                                    //todo handle populating on team creation + roles
                                    //populating players, game and captain
                                    // Team.populate(team, {path: 'players'}, function (err, team) {
                                    //     if(err)
                                    //         return next(err);
                                    //     else {
                                    //         Team.populate(team, {path: 'captain'}, function (err, team) {
                                    //             if(err)
                                    //                 return next(err);
                                    //             else {
                                    //                 res.set('Content-Type', 'application/json');
                                    //                 res.end(JSON.stringify(team || {}, null, 2));
                                    //             }
                                    //         });
                                    res.set('Content-Type', 'application/json');
                                    res.end(JSON.stringify(team || {}, null, 2));
                                    //     }
                                    // });
                                }
                            });
                        }
                    });
            }
        });
};

// Path: GET api/teams/{teamId}/getTeamById
module.exports.getTeamById = function getTeamById(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the game with id:' + Util.getPathParams(req)[2]);
    // Code necessary to consume the Team API and respond

    Team.findById(
        Util.getPathParams(req)[2])
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, team) {
                if (err)
                    return next(err);

                logger.debug(team);
                if (_.isNull(team) || _.isEmpty(team)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(team || {}, null, 2);
                }
                else {
                    if (team.players.length) {
                        roleService.getTeamRoles(Util.getPathParams(req)[2], function (err, foundRoles) {
                            if (err)
                                return next(err);

                            // if (_.isNull(foundRoles) || _.isEmpty(foundRoles)) {
                            //     res.set('Content-Type', 'application/json');
                            //     res.status(404).json(foundRoles || {}, null, 2);
                            // }
                            else {
                                _.forEach(team.players, function (player) {
                                    player.role = _.find(foundRoles, function (role) {
                                        return player._id == role._doc.playerAccount;
                                    });
                                });
                                res.set('Content-Type', 'application/json');
                                res.end(JSON.stringify(team || {}, null, 2));
                            }
                        });
                    }
                    else {
                        res.set('Content-Type', 'application/json');
                        res.end(JSON.stringify(team || {}, null, 2));
                    }
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
        {name: decodeURIComponent(Util.getPathParams(req)[2])})
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, team) {
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
        //means we want the DB to return the updated document instead of the old one
        {new: true})
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, updatedTeam) {
            if (err)
                return next(err);

            if (_.isNil(updatedTeam) || _.isEmpty(updatedTeam)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(updatedTeam || {}, null, 2);
            }
            else {
                logger.debug("Updated team object: \n" + updatedTeam);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
            }
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
        {new: true}) //means we want the DB to return the updated document instead of the old one
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, updatedTeam) {
            if (err)
                return next(err);
            if (_.isNil(updatedTeam) || _.isEmpty(updatedTeam)) {
                res.set('Content-Type', 'application/json');
                res.status(404).json(tab || {}, null, 2);
            }
            else {
                logger.debug("Deactivated team object: \n" + updatedTeam);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
            }
        });
};

//Path: GET api/teams/{userId}/games/{gameId}
module.exports.getTeamsByUserIdByGameId = function getTeamsByUserIdByGameId(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting teams for user with userId ' + Util.getPathParams(req)[2] + ' and game with gameId:' + Util.getPathParams(req)[4]);

    //get playerAccounts of user
    PlayerAccount.find({user: Util.getPathParams(req)[2]}, function (err, playerAccounts) {
        if (err)
            return next(err);
        if (_.isNil(playerAccounts) || _.isEmpty(playerAccounts)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(playerAccounts || {}, null, 2);
        }
        else {
            let criteriaId = _.map(playerAccounts, '_id');

            //get teams where gameId and playerAccountIds are present
            Team.find({
                game: Util.getPathParams(req)[4],
                players: {$in: criteriaId}
            })
                .populate("game")
                .populate(
                    {
                        path: 'captain',
                        populate: {path: 'user'}
                    })
                .populate(
                    {
                        path: 'players',
                        populate: {path: 'user'}
                    })
                .exec(function (err, foundTeams) {
                    if (err)
                        return next(err);
                    if (_.isNil(foundTeams) || _.isEmpty(foundTeams)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(foundTeams || {}, null, 2);
                    }
                    else {
                        res.set('Content-Type', 'application/json');
                        res.status(200).end(JSON.stringify(foundTeams || {}, null, 2));
                    }
                });
        }
    });
};

//Path: GET api/teams/{userId}
module.exports.getTeamsByUserId = function getTeamsByUserId(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting teams for user with userId ' + Util.getPathParams(req)[2]);

    //get playerAccounts of user
    PlayerAccount.find({user: Util.getPathParams(req)[2]}, function (err, playerAccounts) {
        if (err)
            return next(err);
        if (_.isNil(playerAccounts) || _.isEmpty(playerAccounts)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(playerAccounts || {}, null, 2);
        }
        else {
            let criteriaId = _.map(playerAccounts, '_id');

            //get teams where playerAccountIds are present
            Team.find({
                players: {$in: criteriaId}
            })
                .populate("game")
                .populate(
                    {
                        path: 'captain',
                        populate: {path: 'user'}
                    })
                .populate(
                    {
                        path: 'players',
                        populate: {path: 'user'}
                    })
                .exec(function (err, foundTeams) {
                    if (err)
                        return next(err);
                    if (_.isNil(foundTeams) || _.isEmpty(foundTeams)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(foundTeams || {}, null, 2);
                    }
                    else {
                        res.set('Content-Type', 'application/json');
                        res.status(200).end(JSON.stringify(foundTeams || {}, null, 2));
                    }
                });
        }
    });
};

// Path: PUT api/teams/{teamId}/addPlayer/{playerAccountId}
module.exports.addPlayer = function addPlayer(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Adding playerAccount with id ' + Util.getPathParams(req)[4] + ' to team with teamId' + Util.getPathParams(req)[2]);

    PlayerAccount.findOne({_id: Util.getPathParams(req)[4]}, function (err, foundPlayerAccount) {
        if (err)
            return next(err);
        if (_.isNil(foundPlayerAccount) || _.isEmpty(foundPlayerAccount)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(foundPlayerAccount || {}, null, 2);
        }
        else {
            //recherche de la team
            Team.findOne({_id: Util.getPathParams(req)[2]})
                .populate("captain game players")
                .exec(function (err, team) {
                    if (err)
                        return next(err);
                    if (_.isNil(team) || _.isEmpty(team)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(team || {}, null, 2);
                    }
                    else {
                        //in case players doesn't exist or is empty, create an empty array
                        if (_.isNil(team.players) || _.isEmpty(team.players))
                            team.players = [];

                        //adding new player to team players list
                        team.players = team.players.push(foundPlayerAccount._id);

                        //updating team with updated players list
                        Team.findOneAndUpdate(
                            {_id: Util.getPathParams(req)[2]},
                            {
                                $set: {
                                    players: team.players
                                }
                            },
                            {new: true}) //means we want the DB to return the updated document instead of the old one
                            .populate("game")
                            .populate(
                                {
                                    path: 'captain',
                                    populate: {path: 'user'}
                                })
                            .populate(
                                {
                                    path: 'players',
                                    populate: {path: 'user'}
                                })
                            .exec(function (err, updatedTeam) {
                                if (err)
                                    return next(err);
                                if (_.isNil(updatedTeam) || _.isEmpty(updatedTeam)) {
                                    res.set('Content-Type', 'application/json');
                                    res.status(404).json(updatedTeam || {}, null, 2);
                                }
                                else {
                                    logger.debug("Updated team object: \n" + updatedTeam);
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
                                }
                            });
                    }
                });
        }
    });
};

// Path: GET api/teams/{teamName}/getTeamsByName
module.exports.getTeamsByName = function getTeamByName(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the team with name:' + decodeURIComponent(Util.getPathParams(req)[2]));
    // Code necessary to consume the Team API and respond

    Team.find(
        {name: decodeURIComponent(Util.getPathParams(req)[2])})
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, team) {
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

// Path: GET api/teams/{teamName}/getTeamsByLikeName
module.exports.getTeamsByLikeName = function getTeamByName(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the team with name:' + decodeURIComponent(Util.getPathParams(req)[2]));
    // Code necessary to consume the Team API and respond

    Team.find(
        {name: new RegExp('^.*' + decodeURIComponent(Util.getPathParams(req)[2]) + '.*$', "i")})
        .populate("game")
        .populate(
            {
                path: 'captain',
                populate: {path: 'user'}
            })
        .populate(
            {
                path: 'players',
                populate: {path: 'user'}
            })
        .exec(function (err, team) {
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
