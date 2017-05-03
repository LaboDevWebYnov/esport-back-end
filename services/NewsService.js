/**
 * Created by Brunet Sylvain on 05/04/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    newsApiUrl = " https://newsapi.org/v1/articles",
    keyApi = "5b975610a84f4f2aa4a07150c2b58b73",
    request = require('request');

//LoL: todo add corresponding props


function newsApiRequest(options, callBack) {
    request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                response["body"] = JSON.parse(response["body"]);
                callBack(null, response["body"], body);
            }
            else {
                callBack(error, response["body"], null);
            }
        }
    );
}

module.exports.getNewsIgn = function (cb) {
    let options = {
        url: newsApiUrl + '?source=ign&' +'apiKey=' + keyApi
    };
    newsApiRequest(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            cb(null, response, respObject);
        }
        else {
            cb(error, response, null);
        }
    });
};

module.exports.getNewsPolygon = function (cb) {
    let options = {
        url: newsApiUrl + '?source=polygon&' +'apiKey=' + keyApi
    };
    newsApiRequest(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            cb(null, response, respObject);
        }
        else {
            cb(error, response, null);
        }
    });
};