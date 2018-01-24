
var _ = require('lodash'),
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
    console.log('Pourquoi je suis pas là merde ?');
    let options = {
        url: 'https://api.r6stats.com/api/v1/players/' + username + '/?platform=ps4'
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200){
            callback(null, response, body);
        }
        else {
            callback(error, response, null);
        }
    });
};