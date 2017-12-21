/**
 * Created by Brunet Sylvain on 05/04/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.riot'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    newsApiUrl = " https://newsapi.org/v2/top-headlines",
    keyApi = "907e46e794a048c3935820df72f8797c",
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
        url: newsApiUrl + '?sources=ign&' +'apiKey=' + keyApi
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
        url: newsApiUrl + '?sources=polygon&' +'apiKey=' + keyApi
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