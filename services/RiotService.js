/**
 * Created by probe on 23/02/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    riotApiUrl = "https://euw1.api.riotgames.com/lol",
    season = "SEASON2017",
    keyApi = "RGAPI-5c3f43f6-e84e-4b36-b7f4-9c25c927354b",
    request = require('request');

//LoL: todo add corresponding props
const LOLProps = ["league", "league_point", "wins", "losses", "win_ratio", "kda_season"];

function riotApiRequest(options, callBack) {
    request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callBack(null, response, body);
            }
            else {
                callBack(error, response, null);
            }
        }
    );
}

//https://euw.api.pvp.net/api/lol/euw/v1.4/summoner/by-name/Nef69?api_key=RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da
function getIdByUserName(pseudo, cb) {
    console.log("batard");
    let options = {
        url: riotApiUrl + '/summoner/v3/summoners/by-name/' + pseudo + '?api_key=' + keyApi
    };
    riotApiRequest(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            cb(null, response, respObject.id);

        }
        else {
            cb(error, response, null);
        }
    });
}

//https://euw.api.pvp.net/api/lol/euw/v2.5/league/by-summoner/57467635/entry?api_key=RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da
module.exports.getUserStatsForSeason = function getUserStatsForCSGO(riotUserPseudo, callBack) {
    console.log("je suis gay");
    getIdByUserName(riotUserPseudo, function (err, resp, riotUserId) {

        if (!err && resp.statusCode === 200) {
            let options = {
                url: riotApiUrl + '/league/v3/positions/by-summoner/' + riotUserId + '?api_key=' + keyApi
            };
            riotApiRequest(options, function (error, response, body) {
                let LOLContent = {};

                console.log("jusqu'ici sa va");
                if (!error && response.statusCode === 200) {
                    let respObject = JSON.parse(body);
                    console.log("respobject" + respObject[0].tier);
                    LOLContent[LOLProps[0]] = respObject[0].tier + " " + respObject[0].rank;

                    LOLContent[LOLProps[1]] = respObject[0].leaguePoints;

                    LOLContent[LOLProps[2]] = respObject[0].wins;

                    LOLContent[LOLProps[3]] = respObject[0].losses;

                    LOLContent[LOLProps[4]] = respObject[0].wins / (respObject[0].wins + respObject[0].losses );


                    callBack(null, response, LOLContent);
                }/*if (!error && response.statusCode === 200) {
                    let respObject = JSON.parse(body);
                    console.log("respobject" + respObject[riotUserId][0].tier);
                    LOLContent[LOLProps[0]] = respObject[riotUserId][0].tier + " " + respObject[riotUserId][0].entries[0].division;

                    LOLContent[LOLProps[1]] = respObject[riotUserId][0].entries[0].leaguePoints;

                    LOLContent[LOLProps[2]] = respObject[riotUserId][0].entries[0].wins;

                    LOLContent[LOLProps[3]] = respObject[riotUserId][0].entries[0].losses;

                    LOLContent[LOLProps[4]] = respObject[riotUserId][0].entries[0].wins / (respObject[riotUserId][0].entries[0].wins + respObject[riotUserId][0].entries[0].losses );


                    callBack(null, response, LOLContent);
                }*/
                else {
                    callBack(error, response, null);
                }
            });
        }
        else {
            callBack(err, resp, null);
        }
    });
};


//https://euw.api.pvp.net/api/lol/euw/v1.3/stats/by-summoner/57467635/ranked?season=SEASON2017&api_key=RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da
module.exports.getUserStatsForLol = function getUserStatsForCSGO(riotUserName, callBack) {
    getIdByUserName(riotUserName, function (err, resp, riotUserId) {

        if (!err && resp.statusCode == 200) {
            let options = {
                url: riotApiUrl + 'v3/stats/by-summoner/' + riotUserId + '/ranked?season=' + season + '&api_key=' + keyApi
            };
            riotApiRequest(options, function (error, response, body) {
                let LOLContentKDA = {};
                if (!error && response.statusCode == 200) {
                    let respObject = JSON.parse(body);

                    var kills = 0, deaths = 0, assists = 0,totalMinionsKills = 0,totalDoubleKills=0,totalTripleKills=0,totalQuadraKills=0,totalPentaKills=0;

                    for (var y = 0; y in respObject.champions; y++) {

                        kills = kills + respObject.champions[y].stats.totalChampionKills;
                        deaths = deaths + respObject.champions[y].stats.totalDeathsPerSession;
                        assists = assists + respObject.champions[y].stats.totalAssists;
                        totalMinionsKills = totalMinionsKills + respObject.champions[y].stats.totalMinionKills;
                        totalDoubleKills = totalDoubleKills + respObject.champions[y].stats.totalDoubleKills;
                        totalTripleKills = totalTripleKills + respObject.champions[y].stats.totalTripleKills;
                        totalQuadraKills = totalQuadraKills + respObject.champions[y].stats.totalQuadraKills;
                        totalPentaKills = totalPentaKills + respObject.champions[y].stats.totalPentaKills;
                    }
                    LOLContentKDA["total_kills"] = kills;

                    LOLContentKDA["total_deaths"] = deaths;

                    LOLContentKDA["total_assists"] = assists;

                    LOLContentKDA["total_minions_kills"] = totalMinionsKills;

                    LOLContentKDA["total_double_kills"] = totalDoubleKills;

                    LOLContentKDA["total_triple_kills"] = totalTripleKills;

                    LOLContentKDA["total_quadra_kills"] = totalQuadraKills;

                    LOLContentKDA["total_penta_kills"] = totalPentaKills;

                    callBack(null, response, LOLContentKDA);
                }
                else {
                    callBack(error, response, null);
                }
            });
        }
        else {
            callBack(err, resp, null);
        }
    })
    ;
};






