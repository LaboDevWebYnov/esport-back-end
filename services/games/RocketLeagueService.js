var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.rocket'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    rlApi = "https://api.rocketleaguestats.com/v1/player",
    keyApi = "G5L0Z48K07XRXVFQW8408M8FIOALGP0O",
    request = require('request');

//Rocket League: todo add corresponding props
const RLProps = ["uniqueId", "displayName", "avatar"];


function rlApiRequest(options,callBack) {
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

module.exports.getUserRL = function getUserInformation(steamIdUser,callBack) {
    console.log('SteamID : ' + steamIdUser);
    let returnedArray = {};
    let options = {
        url: rlApi + '?unique_id=' + steamIdUser + '&apikey=' + keyApi + '&platform_id=1'
    };
    rlApiRequest(options,function (error,response,body) {

        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);

            callBack(null,response,respObjectUser);
        }
        else {
            callBack(error,response,null);
        }

    });
};