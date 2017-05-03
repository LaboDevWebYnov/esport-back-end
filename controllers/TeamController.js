/**
 * Created by Thomas on 13/04/2016.
 */
'use strict';

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.team'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    async = require('async'),
    Util = require('./utils/util.js');

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
                //todo ajouter les roles pour chaque team aka call teamPropertyService pour récup ces props
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
                            //todo handle captain's role in case there is a captain
                            //todo verify captain playerAccountId exists
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
                                    //todo handle roles/properties
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
                    //todo handle roles/properties
                    // if (team.players.length) {
                    //     roleService.getTeamRoles(Util.getPathParams(req)[2], function (err, foundRoles) {
                    //         if (err)
                    //             return next(err);
                    //
                    //         // if (_.isNull(foundRoles) || _.isEmpty(foundRoles)) {
                    //         //     res.set('Content-Type', 'application/json');
                    //         //     res.status(404).json(foundRoles || {}, null, 2);
                    //         // }
                    //         else {
                    //             _.forEach(team.players, function (player) {
                    //                 player.role = _.find(foundRoles, function (role) {
                    //                     return player._id == role._doc.playerAccount;
                    //                 });
                    //             });
                    //             res.set('Content-Type', 'application/json');
                    //             res.end(JSON.stringify(team || {}, null, 2));
                    //         }
                    //     });
                    // }
                    // else {
                    res.set('Content-Type', 'application/json');
                    res.end(JSON.stringify(team || {}, null, 2));
                    // }
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
                //todo handle roles/properties
                //si il y a des players
                // if (team._doc.players.length) {
                //     roleService.getTeamRoles(team._id, function (err, foundRoles) {
                //         if (err)
                //             return next(err);
                //
                //         if (_.isNull(foundRoles) || _.isEmpty(foundRoles)) {
                //             res.set('Content-Type', 'application/json');
                //             res.status(404).json(foundRoles || {}, null, 2);
                //         }
                //         else {
                //             //affectation des roles aux players
                //             _.forEach(team.players, function (player) {
                //                 player._doc.role = _.find(foundRoles, function (role) {
                //                     return player._id == role._doc.playerAccount;
                //                 });
                //             });
                //             res.set('Content-Type', 'application/json');
                //             res.end(JSON.stringify(team || {}, null, 2));
                //         }
                //     });
                // }
                // else {
                //pas de players, on renvoie directement
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(team || {}, null, 2));
                // }
            }
        });
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
                //todo handle roles
                //si il y a des players
                // if (updatedTeam._doc.players.length) {
                //     roleService.getTeamRoles(updatedTeam._id, function (err, foundRoles) {
                //         if (err)
                //             return next(err);
                //
                //         if (_.isNull(foundRoles) || _.isEmpty(foundRoles)) {
                //             res.set('Content-Type', 'application/json');
                //             res.status(404).json(foundRoles || {}, null, 2);
                //         }
                //         else {
                //             //affectation des roles aux players
                //             _.forEach(updatedTeam.players, function (player) {
                //                 player._doc.role = _.find(foundRoles, function (role) {
                //                     return player._id == role._doc.playerAccount;
                //                 });
                //             });
                //             logger.debug("Updated team object: \n" + updatedTeam);
                //             res.set('Content-Type', 'application/json');
                //             res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
                //         }
                //     });
                // }
                // else {
                //pas de players, on renvoie directement
                logger.debug("Updated team object: \n" + updatedTeam);
                //todo handle roles/properties
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
                // }
            }
        });
};

// Path: PUT api/teams/{teamId}/updateCaptain/{playerAccountId}
module.exports.updateCaptain = function updateCaptain(req, res, next) {
    PlayerAccount.findOne({_id: Util.getPathParams(req)[4]}, function (err, user) {
        if(err)
            return next(err);

        if (_.isNil(user) || _.isEmpty(user)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(user || {}, null, 2);
        }
        else {
            Team.findOneAndUpdate(
                {_id: Util.getPathParams(req)[2]},
                {
                    $set: {
                        captain: user,
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
                        //todo handle roles
                        //si il y a des players
                        // if (updatedTeam._doc.players.length) {
                        //     roleService.getTeamRoles(updatedTeam._id, function (err, foundRoles) {
                        //         if (err)
                        //             return next(err);
                        //
                        //         if (_.isNull(foundRoles) || _.isEmpty(foundRoles)) {
                        //             res.set('Content-Type', 'application/json');
                        //             res.status(404).json(foundRoles || {}, null, 2);
                        //         }
                        //         else {
                        //             //affectation des roles aux players
                        //             _.forEach(updatedTeam.players, function (player) {
                        //                 player._doc.role = _.find(foundRoles, function (role) {
                        //                     return player._id == role._doc.playerAccount;
                        //                 });
                        //             });
                        //             logger.debug("Updated team object: \n" + updatedTeam);
                        //             res.set('Content-Type', 'application/json');
                        //             res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
                        //         }
                        //     });
                        // }
                        // else {
                        //pas de players, on renvoie directement
                        logger.debug("Updated team object: \n" + updatedTeam);
                        //todo handle roles/properties
                        res.set('Content-Type', 'application/json');
                        res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
                        // }
                    }
                });
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
                //todo handle roles/properties
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
                        //todo handle roles/properties
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
                        //todo handle roles/properties
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

                        //check playerId isn't in the list yet
                        //in case player already present in team, abord
                        if (_.some(team._doc.players, function (o) {
                                return _.isEqual(o._doc._id, foundPlayerAccount._id)
                            })) {
                            logger.info("PlayerAccount with id: " + foundPlayerAccount._id + "is already present in the team");
                            res.set('Content-Type', 'application/json');
                            res.status(400).json({error: {code: 'E_PLAYER_ALREADY_IN_TEAM', message: 'Player is already present in the team'}} || {}, null, 2);
                        }
                        else {
                            //adding new player to team's players list
                            team.players = team.players.push(foundPlayerAccount._id);

                            let teamToReturn = {};

                            //todo handle roles
                            async.series([
                                function (cb) {
                                    //todo add role
                                    cb();
                                },
                                function (cb) {
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
                                                cb(err, 'Mise à jour players list');
                                            if (_.isNil(updatedTeam) || _.isEmpty(updatedTeam)) {
                                                cb({
                                                    error: {
                                                        code: 'E_TEAM_NOT_FOUND',
                                                        message: 'Could not find team to update'
                                                    }
                                                }, 'Mise à jour players list');
                                            }
                                            else {
                                                teamToReturn = updatedTeam;
                                                cb(null, 'Mise à jour players list');
                                            }
                                        });
                                }
                            ], function (err, results) {
                                logger.debug('results: ' + results);
                                if (err) {
                                    res.set('Content-Type', 'application/json');
                                    res.status(404).json(teamToReturn || {}, null, 2);
                                }
                                else {
                                    //todo handle roles/properties
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(teamToReturn || {}, null, 2));
                                }
                            });
                        }
                    }
                });
        }
    });
};

//PATH: PUT api/teams/{teamId}/removePlayer/{playerAccountId}
module.exports.removePlayer = function removePlayer(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Removing playerAccount with id ' + Util.getPathParams(req)[4] + ' from team with teamId' + Util.getPathParams(req)[2]);

    //todo remove the corresponding teamProperties containing the given playerAccountId
    Team.findOneAndUpdate(
        {_id: Util.getPathParams(req)[2]},
        {$pull: {players: Util.getPathParams(req)[4]}},
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
                //todo handle roles/properties
                logger.debug("Updated team object: \n" + updatedTeam);
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(updatedTeam || {}, null, 2));
            }
        });
};

// Path: GET api/teams/{teamName}/getTeamsByName
module.exports.getTeamsByName = function getTeamByName(req, res, next) {
    logger.debug('BaseUrl:' + req.originalUrl);
    logger.debug('Path:' + req.path);

    logger.info('Getting the team with name:' + decodeURIComponent(Util.getPathParams(req)[2]));

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
        .exec(function (err, teams) {
                if (err)
                    return next(err);

                logger.debug(teams);

                if (_.isNull(teams) || _.isEmpty(teams)) {
                    res.set('Content-Type', 'application/json');
                    res.status(404).json(teams || {}, null, 2);
                }
                else {
                    //todo handle roles/properties
                    res.set('Content-Type', 'application/json');
                    res.status(200).end(JSON.stringify(teams || {}, null, 2));
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
                //todo handle roles/properties
                res.set('Content-Type', 'application/json');
                res.status(200).end(JSON.stringify(team || {}, null, 2));
            }
        });
};
