/**
 * Created by probe on 23/02/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    riotApiUrl = "https://euw.api.pvp.net/api/lol/euw/",
    season = "SEASON2017",
    keyApi = "RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da",
    request = require('request');


//LoL: todo add corresponding props
const LOLProps = ["league","league_point","wins","losses","win_ratio","kda_season"];

function riotApiRequest(options,callBack) {
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

//https://euw.api.pvp.net/api/lol/euw/v1.4/summoner/by-name/Nef69?api_key=RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da
function getIdByUserName(pseudo,cb) {
    let options = {
        url: riotApiUrl + 'v1.4/summoner/by-name/' + pseudo + '?api_key=' + keyApi
    };
    riotApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            cb(null,response,respObject[pseudo.toLowerCase()].id);
        }
        else {
            cb(error,response,null);
        }
    });
}

//https://euw.api.pvp.net/api/lol/euw/v2.5/league/by-summoner/57467635/entry?api_key=RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da
module.exports.getUserStatsForSeason = function getUserStatsForCSGO(riotUserPseudo,callBack) {
    getIdByUserName(riotUserPseudo,function (err,resp,riotUserId) {
        if (!err && resp.statusCode == 200) {
            let options = {
                url: riotApiUrl + 'v2.5/league/by-summoner/' + riotUserId + '/entry?api_key=' + keyApi
            };
            riotApiRequest(options,function (error,response,body) {

                let LOLContent = [];
                if (!error && response.statusCode == 200) {
                    let respObject = JSON.parse(body);

                    LOLContent.push({
                        propertyName : LOLProps[0],
                        value : respObject[riotUserId][0].tier + respObject[riotUserId][0].entries[0].division
                    });

                    LOLContent.push({
                        propertyName : LOLProps[1],
                        value : respObject[riotUserId][0].entries[0].leaguePoints
                    });

                    LOLContent.push({
                        propertyName : LOLProps[2],
                        value : respObject[riotUserId][0].entries[0].wins
                    });

                    LOLContent.push({
                        propertyName : LOLProps[3],
                        value : respObject[riotUserId][0].entries[0].losses
                    });

                    LOLContent.push({
                        propertyName : LOLProps[4],
                        value : respObject[riotUserId][0].entries[0].wins / (respObject[riotUserId][0].entries[0].wins + respObject[riotUserId][0].entries[0].losses )
                    });



                    callBack(null,response,LOLContent);
                }
                else {
                    callBack(error,response,null);
                }
            });
        }
        else {
            callBack(err,resp,null);
        }
    });
};




//https://euw.api.pvp.net/api/lol/euw/v1.3/stats/by-summoner/57467635/ranked?season=SEASON2017&api_key=RGAPI-c6bdd877-4a79-4042-b5e0-9d957ae442da
module.exports.getUserStatsForLol = function getUserStatsForCSGO(riotUserName,callBack) {
    getIdByUserName(riotUserName,function (err,resp,riotUserId) {

        if (!err && resp.statusCode == 200) {
            let options = {
                url: riotApiUrl + 'v1.3/stats/by-summoner/' + riotUserId + '/ranked?season=' + season + '&api_key=' + keyApi
            };
            riotApiRequest(options,function (error,response,body) {
                let LOLContentKDA = [];
                if (!error && response.statusCode == 200) {
                    let respObject = JSON.parse(body);

                    var kills=0,deaths=0,assists=0;

                    for(var y=0;y in respObject.champions;y++){
                        kills = kills + respObject.champions[y].stats.totalChampionKills;
                        deaths = deaths + respObject.champions[y].stats.totalDeathsPerSession;
                        assists = assists + respObject.champions[y].stats.totalAssists;
                    }

                    LOLContentKDA.push({
                        propertyName : LOLProps[5],
                        value : [
                            {
                                propertyName : "total_kills",
                                value : kills
                            },
                            {
                                propertyName : "total_deaths",
                                value : deaths
                            },
                            {
                                propertyName : "total_assists",
                                value : assists
                            },
                        ]
                    });

                    callBack(null,response,LOLContentKDA);
                }
                else {
                    callBack(error,response,null);
                }
            });
        }
        else {
            callBack(err,resp,null);
        }
    });
};






