var mongoose = require('mongoose'),
    sanitizer = require('sanitizer'),
    _ = require('lodash'),
    toornamentApiUrl = "https://api.toornament.com/",
    keyApi = "ATEr83fFz4LIc6rIvyArx-rZ32kRaG_15SQSwFbtdRg",
    request = require('request');
    clientSecret = '1hu0ts6jyv8googo0kks0wog44w00gok84soc48g4cgc0848o8';
    clientId = '9ce161687677adaf69d21a192nktf5mifmskkg0804cskwggko8skwwc8goso8o4ggg4s4gc4c';


function toornamentApiRequest(options,callBack) {
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

function generateGetUrlFromParams(route, params){
    let options;
    if(params['access_token']){
        options = {
            url: toornamentApiUrl + route + '?=',
            method: 'GET',
            headers: {
                'X-Api-Key': keyApi,
                Authorization: 'Bearer ' + params['access_token']
            }
        };
    }else{
        options = {
            url: toornamentApiUrl + route + '?=',
            method: 'GET',
            headers: {
                'X-Api-Key': keyApi
            }
        };
    }

    if(params['discipline']){
        options.url += '&discipline=' + params['discipline'];
    }
    if(params['archived']){
        options.url += '&archived=' + params['archived'];
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
    if(params['page']){
        options.url += '&page=' + params['page'];
    }
    if(params['has_result']){
        options.url += '&has_result=' + params['has_result'];
    }
    if(params['stage_number']){
        options.url += '&stage_number=' + params['stage_number'];
    }
    if(params['group_number']){
        options.url += '&group_number=' + params['group_number'];
    }
    if(params['round_number']){
        options.url += '&round_number=' + params['round_number'];
    }
    if(params['participant_id']){
        options.url += '&participant_id=' + params['participant_id'];
    }
    if(params['with_games']){
        options.url += '&with_games=' + params['with_games'];
    }

    logger.info(options);

    return options;
}

// OAUTH2

// https://api.toornament.com/oauth/v2/token
module.exports.oauth2 = function Oauth2(callBack){

    let options = {
        url: toornamentApiUrl + 'oauth/v2/token',
        method: 'POST',
        form: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }
    };

    toornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// TOURNAMENT

// https://api.toornament.com/v1/tournaments
module.exports.getTournaments = function getTournaments(params, callBack){

    let options = generateGetUrlFromParams('v1/tournaments', params);

    toornamentApiRequest(options,function (error,response,body) {

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

    let options = generateGetUrlFromParams('v1/tournaments/' + id, []);

    logger.info(options.url);

    toornamentApiRequest(options,function (error,response,body) {

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
module.exports.getMyTournaments = function getMyTournaments(params, callBack){

    let options = generateGetUrlFromParams('v1/me/tournaments', params);
    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches
module.exports.getMatchesByTournament = function getMatchesByTournament(id, params, callBack){

    let options = generateGetUrlFromParams('v1/tournaments/' + id +'/matches', params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/disciplines/{discipline_id}/matches
module.exports.getMatchesByDiscipline = function getMyTournaments(id, params, callBack){

    let options = generateGetUrlFromParams( "v1/disciplines/" + id + "/matches", params);
    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        let respObject = JSON.parse(body);
        if (!error && respObject.statusCode != 404) {

            callBack(null,response,null);
        }
        else {
            callBack(error,response,null);
        }
    });
};