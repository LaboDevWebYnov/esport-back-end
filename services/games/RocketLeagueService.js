var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    rlApi = "https://api.rocketleaguestats.com/v1/player",
    keyApi = "G5L0Z48K07XRXVFQW8408M8FIOALGP0O",
    request = require('request'),
    steamIdUser = '76561198033338223';


//Rocket League: todo add corresponding props
const RLProps = ["uniqueId", "displayName", "avatar"];

function rlApiRequest(options, callBack) {
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

module.exports.getUserRL = function getUserStatsRL(callBack) {
    let options = {
        url: rlApi + '?unique_id=' + steamIdUser + '&key=' + keyApi + '&platform_id=1'
    };
    rlApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            let tab=[];
            let tabVarName=
                ["uniqueId", "displayName", "avatar"]
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