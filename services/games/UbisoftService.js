
var _ = mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    ubiApiUrl = "https://api.r6stats.com/api/",

    request = require('request');

function r6ApiRequest(options,callBack) {
    request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {

                response = response;
                callBack(null,response,body);
            }
            else {
                callBack(error,response,null);
            }
        }
    );
}

module.exports.getR6Stats = function getUserStatsForR6(username, callback) {
    let options = {
        url: ubiApiUrl+'v1/players/' + username + '/?platform=ps4'
    };
    request(options, function (error, response, body) {
        body = JSON.parse(body);
        if (!error && response.statusCode == 200){
            callback(null, response, body);
        }
        else {
            callback(error, response, null);
        }
    });
};