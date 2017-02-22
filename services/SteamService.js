/**
 * Created by probe on 22/02/2017.
 */

var Promise = require("bluebird"),
    logger = require('log4js').getLogger('service.steam'),
    mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    steamApiUrl = "http://api.steampowered.com/",
    keyApi = "39A6689D4080067134EF2BA0F6B780FF",
    appIdDota2 = "570",
    appIdCsGo = "730",
    request = require('request');






function steamApiRequest(options,callBack) {
    request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callBack(null,body);
            }
            else {
                callBack(error,null);
            }
        }
    );
}

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
    let options = {
        url: steamApiUrl + 'ISteamUser/GetPlayerSummaries/v0002/?key=' + keyApi + '&steamids=' + steamIdUser + '&format=json'
    };
    steamApiRequest(options,callBack);
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

//http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=39A6689D4080067134EF2BA0F6B780FF&steamid=76561198035307337
module.exports.getUserStatsForCSGO = function getUserStatsForCSGO(steamIdUser,callBack) {
    let options = {
        url: steamApiUrl + 'ISteamUserStats/GetUserStatsForGame/v0002/?appid=' + appIdCsGo + '&key=' + keyApi + '&steamid=' + steamIdUser + '&format=json'
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