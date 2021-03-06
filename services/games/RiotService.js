/**
 * Created by probe on 23/02/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    riotApiUrl = "https://euw1.api.riotgames.com/lol",
    season = "SEASON2017",
    keyApi = "RGAPI-e002bdc8-2798-40dd-a1e7-3ce4bc70a240",
    request = require('request');

//LoL: todo add corresponding props
const LOLProps = ["league", "league_point", "wins", "losses", "win_ratio", "kda_season"];


function lolApiRequest(options,callBack) {
    request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callBack(null,response,body);
            }
            else {
                callBack(error,response,null);
            }
        }
    );
}

module.exports.getUserLol = function getUserInformation(lolName,callBack) {
    console.log('Username Lol : ' + lolName);
    let returnedArray = {};
    let options = {
        url: riotApiUrl + '/summoner/v3/summoners/by-name/' + lolName + '?api_key=' + keyApi
    };
    lolApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);

            callBack(null,response,respObjectUser);
        }
        else {
            callBack(error,response,null);
        }

    });
};
module.exports.getWinLooseLol = function getWinLooseLol(summonerId,callBack) {
    console.log('Summoner id Lol : ' + summonerId);
    let returnedArray = {};
    let options = {
        url: riotApiUrl + '/league/v3/positions/by-summoner/' + summonerId + '?api_key=' + keyApi
    };
    lolApiRequest(options,function (error,response,body) {

        console.log("je suis la");
        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);
                    console.log(respObjectUser);
            callBack(null,response,respObjectUser);
        }
        else {
            callBack(error,response,null);
            console.log(error);
        }

    });
};

module.exports.getLastMatchLol = function getUserMatches(accountId ,callBack) {
    console.log('Game with accoundId = ' + accountId);
    let returnedArray = {};
    let options = {
        url: riotApiUrl + '/match/v3/matchlists/by-account/' + accountId + '?api_key=' + keyApi
    };
    lolApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);



            callBack(null,response,respObjectUser);
        }
        else {
            callBack(error,response,null);
        }

    });
};

module.exports.getMatcheInfo = function getUserMatchesInfos(tableMatchId, accountId, callBack) {
    let tableMatchsInfos =  [];
    let count  = 0;
    _.each(tableMatchId, function (matchId) {edArray = {};
        let options = {
            url: riotApiUrl + '/match/v3/matches/' + matchId + '?api_key=' + keyApi
        };
        request(options,function (error,response,body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                _.each(body.participantIdentities, function (participentIdentitie) {
                    if (participentIdentitie.player.accountId == accountId) {
                        _.each(body.participants, function (participant) {
                            if (participant.participantId == participentIdentitie.participantId) {
                                tableMatchsInfos[count] = {};
                                tableMatchsInfos[count].player_stats = participant;

                                _.each(body.teams, function (team) {
                                    if (team.teamId === participant.teamId){
                                        tableMatchsInfos[count].team_stats = team;
                                    }
                                })
                            }
                        })
                    }
                })
                count += 1;
                if (count === tableMatchId.length){
                    callBack(null,tableMatchsInfos);
                }
            }
        })
    });
};