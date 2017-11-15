var mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    toornamentApiUrl = "https://api.toornament.com/v1/",
    keyApi = "ATEr83fFz4LIc6rIvyArx-rZ32kRaG_15SQSwFbtdRg",
    request = require('request');


function ToornamentApiRequest(options,callBack) {
    request(options, function (error, response, body) {

        logger.info(response.statusCode);

        if (!error && response.statusCode == 200) {
                callBack(null,response,body);
            }
            else {
                callBack(error,response,null);
            }
        }
    );
}

// TOURNAMENT

// https://api.toornament.com/v1/tournaments
module.exports.getTournaments = function getTournaments(params, callBack){

    let options = {
        url: toornamentApiUrl + 'tournaments' +  '?api_key=' + keyApi
    };

    if(params['discipline']){
        options.url += '&discipline=' + params['discipline'];
    }
    if(params['status']){
        options.url += '&status=' + params['status'];
    }
    if(params['featured']){
        options.url += '&featured=' + params['featured'];
    }
    if(params['online']){
        options.url += '&online=' + params['online'];
    }
    if(params['country']){
        options.url += '&country=' + params['country'];
    }
    if(params['after_start']){
        options.url += '&after_start=' + params['after_start'];
    }
    if(params['before_start']){
        options.url += '&before_start=' + params['before_start'];
    }
    if(params['after_end']){
        options.url += '&after_end=' + params['after_end'];
    }
    if(params['before_end']){
        options.url += '&before_end=' + params['before_end'];
    }
    if(params['sort']){
        options.url += '&sort=' + params['sort'];
    }
    if(params['name']){
        options.url += '&name=' + params['name'];
    }

    logger.info('url', options.url);


    ToornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments
module.exports.addTournament = function postTournament(callBack){

};

// https://api.toornament.com/v1/tournaments/{id}
module.exports.getOneTournamentById = function getOneTournamentById(id, callBack){
    let options = {
        url: toornamentApiUrl + 'tournaments/' + id +  '?api_key=' + keyApi
    };
    logger.info(options.url);

    ToornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/me/tournaments
module.exports.getMyTournaments = function getOneTournamentById(id, callBack){
    let options = {
        url: toornamentApiUrl + 'me/tournaments/' + '?api_key=' + keyApi
    };
    logger.info(options.url);

    ToornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};