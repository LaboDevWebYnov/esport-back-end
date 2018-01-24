/**
 * Created by probe on 23/02/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    OverWatchApiUrl = "https://api.lootbox.eu/pc/eu/",
    request = require('request');


function OverWatchApiRequest(options,callBack) {
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


//OverWatch todo add corresponding props
const OWprops = ["rank_competitive","wins","losses","win_rate","playtime_competitive","playtime_quick","most_played_hero"];



//https://api.lootbox.eu/pc/eu/Sylvanus-21195/competitive/heroes
module.exports.getUserHeroesCompetitiveStats = function getUserStatsForCSGO(OverWatchUserPseudo,callBack) {
    let options = {
        url: OverWatchApiUrl + OverWatchUserPseudo + '/competitive/heroes'
    };
    OverWatchApiRequest(options,function (error,response,body) {
        let OWContent = [];
        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            OWContent.push({
                propertyName : OWprops[6],
                value :[
                    {
                        propertyName : "name_heroe",
                        value : respObject[0].name
                    },
                    {
                        propertyName : "playtime_heroe",
                        value : respObject[0].playtime
                    },
                ]
            });
            callBack(null,response,OWContent);
        }
        else {
            callBack(error,response,null);
        }
    });
};

//https://api.lootbox.eu/pc/eu/Sylvanus-21195/profile
module.exports.getUserProfileStats = function getUserStatsForCSGO(OverWatchUserPseudo,callBack) {
    let options = {
        url: OverWatchApiUrl + OverWatchUserPseudo + '/profile'
    };
    OverWatchApiRequest(options,function (error,response,body) {

        let OWContent = [];
        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            OWContent.push({
                propertyName : OWprops[0],
                value : respObject.data.competitive.rank
            });
            OWContent.push({
                propertyName : OWprops[1],
                value : respObject.data.games.competitive.wins
            });
            OWContent.push({
                propertyName : OWprops[2],
                value : respObject.data.games.competitive.lost
            });
            OWContent.push({
                propertyName : OWprops[3],
                value : Number(respObject.data.games.competitive.wins) / Number(respObject.data.games.competitive.played)
            });
            OWContent.push({
                propertyName : OWprops[4],
                value : respObject.data.playtime.competitive
            });
            OWContent.push({
                propertyName : OWprops[5],
                value : respObject.data.playtime.quick
            });

            callBack(null,response,OWContent);
        }
        else {
            callBack(error,response,null);
        }
    });
};

