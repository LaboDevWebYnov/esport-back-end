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
                callBack(null, response, body);
            }
            else {
                callBack(error, response, null);
            }
        }
    );
}

function getNews() {
    let options = {
        url: newsApiUrl + '?source=techcrunch&' +'?api_key=' + keyApi
    };
    newsApiRequest(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            let respObject = JSON.parse(body);
            cb(null, response, respObject[pseudo.toLowerCase()].id);
        }
        else {
            cb(error, response, null);
        }
    });
}