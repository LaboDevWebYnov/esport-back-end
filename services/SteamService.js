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
let CSGOStatsContent = [];
const CSGOUserProperties = ['country','name','pseudo'];
let CSGOUserPropertiesContent = [];


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
            let tab=[];
            let tabVarName=["total_kills","total_time_played","total_mvps","total_deaths","total_kills_headshot","total_matches_won","total_matches_played","total_shots_fired","total_shots_hit"]
            _.forEach(respObject.playerstats.stats, function (stat) {
                if(_.includes(tabVarName,stat.name)){
                    tab.push(stat);
                }
            });
            CSGOStatsContent[0] = {propertyName : "total_kills",value : tab[0].value};
            CSGOStatsContent[1] = {propertyName : "kill_death_ratio",value : tab[0].value / tab[1].value};
            CSGOStatsContent[2] = {propertyName : "total_time_played",value : tab[2].value};
            CSGOStatsContent[3] = {propertyName : "total_mvps",value : tab[6].value};
            CSGOStatsContent[4] = {propertyName : "ratio_win_loose",value : tab[7].value / tab[8].value};
            CSGOStatsContent[5] = {propertyName : "kills_by_heads_shot",value : tab[3].value / tab[0].value};
            CSGOStatsContent[6] = {propertyName : "accuracy",value : tab[4].value / tab[5].value};
            callBack(null,response,CSGOStatsContent);
        }
        else {
            callBack(error,response,null);
        }

    });
};

//http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=39A6689D4080067134EF2BA0F6B780FF&appid=730
module.exports.getSchemaForCSGO = function getSchemaForCSGO(callBack) {
    let options = {
        url: steamApiUrl + 'ISteamUserStats/GetSchemaForGame/v2/?key=' + keyApi + '&appid=' + appIdCsGo + '&format=json'
    };
    steamApiRequest(options,callBack);
};

//http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=39A6689D4080067134EF2BA0F6B780FF&steamid=76561198035307337&format=json
module.exports.getUserOwnedGames = function getUserOwnedGames(steamIdUser,callBack) {
    let options = {
        url: steamApiUrl + 'IPlayerService/GetOwnedGames/v0001/?key=' + keyApi + '&steamid=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,callBack);
};

//http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=39A6689D4080067134EF2BA0F6B780FF&steamids=76561198035307337
module.exports.getUserInformation = function getUserInformation(steamIdUser,callBack) {
    let returnedArray = [];
    let options = {
        url: steamApiUrl + 'ISteamUser/GetPlayerSummaries/v0002/?key=' + keyApi + '&steamids=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);
            _.forEach(respObjectUser.response.players, function (player) {
                returnedArray.push({propertyName : "country",value : player.loccountrycode});
                returnedArray.push({propertyName : "name",value : player.realname});
                returnedArray.push({propertyName : "pseudo",value : player.personaname});
            });
            callBack(null,response,returnedArray);
        }
        else {
            callBack(error,response,null);
        }

    });
};

//http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=730&key=39A6689D4080067134EF2BA0F6B780FF&steamid=76561198035307337
module.exports.getUserAchievementsForCSGO = function getUserAchievementsForCSGO(steamIdUser,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamUserStats/GetPlayerAchievements/v0001/?appid=' + appIdCsGo + '&key=' + keyApi + '&steamid=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,callBack);
};

//http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=570&key=39A6689D4080067134EF2BA0F6B780FF&steamid=76561198035307337
module.exports.getUserAchievementsForDota2 = function getUserAchievementsForDota2(steamIdUser,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamUserStats/GetPlayerAchievements/v0001/?appid=' + appIdDota2 + '&key=' + keyApi + '&steamid=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,callBack);
};


//http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=39A6689D4080067134EF2BA0F6B780FF&steamids=76561198035307337
module.exports.getPlayerBans = function getPlayerBans(steamIdUser,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamUser/GetPlayerBans/v1/?key=' + keyApi + '&steamids=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,callBack);
};

//http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=730&count=3&format=json
module.exports.getNewsCSGO = function getNewsCSGO(nbOfNews,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamNews/GetNewsForApp/v0002/?appid=' + appIdCsGo + '&count=' + nbOfNews + '&format=json'
    };
    steamApiRequest(options,callBack);
};

//http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=730&count=3&format=json
module.exports.getNewsDota2 = function getNewsDota2(nbOfNews,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamNews/GetNewsForApp/v0002/?appid=' + appIdDota2 + '&count=' + nbOfNews + '&format=json'
    };
    steamApiRequest(options,callBack);
};