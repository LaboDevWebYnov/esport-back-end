/**
 * Created by probe on 22/02/2017.
 */

var mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    steamApiUrl = "http://api.steampowered.com/",
    keyApi = "39A6689D4080067134EF2BA0F6B780FF",
    appIdDota2 = "570",
    appIdCsGo = "730",
    request = require('request');

//CS:GO: todo add corresponding props
const CSGOStats = ['total_kills', 'kill_death_ratio', 'total_time_played','total_mvps','ratio_win_loose', 'kills_by_heads_shot','accuracy'];
const CSGOUserProperties = ['country','name','pseudo','avatar'];


//Rocket League: todo add corresponding props
const RLprops = [];
let RLContent = [];

//Dota 2: todo add corresponding props
const DOTA2props = [];
let DOTA2Content = [];





function steamApiRequest(options,callBack) {
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

//http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=39A6689D4080067134EF2BA0F6B780FF&steamid=76561198035307337
module.exports.getUserStatsForCSGO = function getUserStatsForCSGO(steamIdUser,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamUserStats/GetUserStatsForGame/v0002/?appid=' + appIdCsGo + '&key=' + keyApi + '&steamid=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            let CSGOStatsContent = {};
            let tab=[];
            let tabVarName=["avatar","total_kills","total_time_played","total_mvps","total_deaths","total_kills_headshot","total_matches_won","total_matches_played","total_shots_fired","total_shots_hit","total_rounds_played"]
            _.forEach(respObject.playerstats.stats, function (stat) {
                if(_.includes(tabVarName,stat.name)){
                    tab.push(stat);
                }
            });
            for(let y=0;y in tab;y++){
                CSGOStatsContent[tab[y].name] = tab[y].value;
            }

            callBack(null,response,CSGOStatsContent);
        }
        else {
            callBack(error,response,null);
        }

    });
};

//http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=39A6689D4080067134EF2BA0F6B780FF&steamids=76561198035307337
module.exports.getUserInformation = function getUserInformation(steamIdUser,callBack) {
    let returnedArray = {};
    let options = {
        url: steamApiUrl + 'ISteamUser/GetPlayerSummaries/v0002/?key=' + keyApi + '&steamids=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);
            _.forEach(respObjectUser.response.players, function (player) {
                returnedArray["country"] = player.loccountrycode;
                returnedArray["name"] = player.realname;
                returnedArray["pseudo"] = player.personaname;
                returnedArray["avatar"] =player.avatar;
            });
            callBack(null,response,returnedArray);
        }
        else {
            callBack(error,response,null);
        }

    });
};
