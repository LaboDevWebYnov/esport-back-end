/**
 * Created by Brunet Sylvain on 05/04/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.news'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    newsApiUrl = " https://newsapi.org/v2/top-headlines",
    keyApi = "907e46e794a048c3935820df72f8797c",
    request = require('request');



function newsApiRequest(options, callBack) {
    request(options, function (error, response, body) {

            if (!error && JSON.parse(response.statusCode) === 200) {

                response = response;


                callBack(null, response, body);
            }
            else {
                callBack(error, response, null);
            }
        }
    );
}

module.exports.getNewsIgn = function (cb) {
    let options = {
        url: newsApiUrl + '?sources=ign&' +'apiKey=' + keyApi
    };
    newsApiRequest(options, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            let respObject = JSON.parse(body);
            cb(null, JSON.parse(response["body"]), respObject);
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

        if (!error && response.statusCode === 200) {
            let respObject = JSON.parse(body);
            logger.info('it works polygon');
            cb(null, JSON.parse(response["body"]), respObject);
        }
        else {
            cb(error, response, null);
        }
    });
};