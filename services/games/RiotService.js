/**
 * Created by probe on 23/02/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    riotApiUrl = "https://euw1.api.riotgames.com/lol",
    season = "SEASON2017",
    keyApi = "RGAPI-634f1f3a-dad7-424d-b076-56346cb85ee5",
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

module.exports.getMatcheInfo = function getUserMatchesInfos(matchId ,callBack) {
    let returnedArray = {};
    let options = {
        url: riotApiUrl + '/match/v3/matches/' + matchId + '?api_key=' + keyApi
    };
    lolApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);
            console.log(respObjectUser);
            console.log('end');
            callBack(null,response,respObjectUser);
        }
        else {
            callBack(error,response,null);
        }

    });
};