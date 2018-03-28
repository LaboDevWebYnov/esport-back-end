/**
 * Created by Brunet Sylvain on 05/04/2017.
 */

var mongoose = require('mongoose'),
    logger = require('log4js').getLogger('service.news'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    newsApiUrl = " https://newsapi.org/v2/",
    keyApi = "907e46e794a048c3935820df72f8797c",
    request = require('request');



function newsApiRequest(options, callBack) {
    request(options, function (error, response, body) {

            if (!error && JSON.parse(response.statusCode) === 200) {




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
        url: newsApiUrl + 'top-headlines?sources=ign,polygon&' +'apiKey=' + keyApi,
        headers: {
            'Connection': 'keep-alive'
        }
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
        url: newsApiUrl + 'top-headlines?sources=polygon&' +'apiKey=' + keyApi
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



module.exports.getNewsSearch = function getNewsSearch(query,cb) {
    var options = {
        url: newsApiUrl + 'everything?q='+ query + '&apiKey=' + keyApi
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

/*
module.exports.getNewsSearch = function getNewsSearch(query,callBack) {
    logger.debug('Query : ' + query);
    query = query.query.search;


    let options = {
        url: newsApiUrl + 'everything?q=' + query + '&apiKey=' + keyApi
    };
    newsApiRequest(options,function (error,response,body) {

        console.log("je suis la");
        if (!error && response.statusCode == 200) {
            let respObjectUser = JSON.parse(body);
            console.log(respObjectUser);
            callBack(null,JSON.parse(response["body"]),respObjectUser);
        }
        else {
            callBack(error,response,null);
            console.log(error);
        }

    });
};*/