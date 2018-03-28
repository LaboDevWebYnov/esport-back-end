var mongoose = require('mongoose'),
    ObjectID = mongoose.Types.ObjectId,
    sanitizer = require('sanitizer'),
    AddTournamentModel = require('../models/AddTournamentModel');
    AddParticipantModel = require('../models/AddParticipantModel');
    _ = require('lodash'),
    toornamentApiUrl = "https://api.toornament.com/",
    keyApi = "ATEr83fFz4LIc6rIvyArx-rZ32kRaG_15SQSwFbtdRg",
    request = require('request');
    clientSecret = '1hu0ts6jyv8googo0kks0wog44w00gok84soc48g4cgc0848o8';
    clientId = '9ce161687677adaf69d21a192nktf5mifmskkg0804cskwggko8skwwc8goso8o4ggg4s4gc4c'
    token_tournament = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijg4ODdiNmFhN2RlZjU5Y2VhNjgzODllZmVhNTc4MjU0ZTIzNGQ3OTliYWQ1MzZiYjRkMjgxYTRkODFmZWQ1MTU4ZGZiZTljN2Y4NzVlYzI4In0.eyJhdWQiOiI5Y2UxNjE2ODc2NzdhZGFmNjlkMjFhMTkybmt0ZjVtaWZtc2trZzA4MDRjc2t3Z2drbzhza3d3Yzhnb3NvOG80Z2dnNHM0Z2M0YyIsImp0aSI6Ijg4ODdiNmFhN2RlZjU5Y2VhNjgzODllZmVhNTc4MjU0ZTIzNGQ3OTliYWQ1MzZiYjRkMjgxYTRkODFmZWQ1MTU4ZGZiZTljN2Y4NzVlYzI4IiwiaWF0IjoxNTIxMTkwNjczLCJuYmYiOjE1MjExOTA2NzMsImV4cCI6MTUyMTI4MDY3Mywic3ViIjoiIiwic2NvcGVzIjpbXX0.tzzpDzTLEBXsQhKKiDGespXVKhz26IsE0ngWlMF7kFSIZxCIXrhNpwf85d_uWjTPkuPJq3XMt2HcdTME3X_qNoIt5IC51a6Nc7mJG39bYXsqFKgARMDLaU6vBA3tafK974hN_724U9EmYUnO8qSkXQ8lrYs9CiuxV7V6xf6YqGET5H-63TsdmTQp5l3hZO-4Xj_GLh9bXMXmZx1QC4ACFyQ9q0xHEWVQXOgwjTelXrZBsJtxap5m8qMltpjm8u4g0iIkQDd7OyzVw48lqkiz4YDMkFOxSWYL9KZhJIPv41dcKb6eKoKgqg-eg3_5ibmAVdVNOsY3rfykD6Y3qz98lw';


function toornamentApiRequest(options,callBack) {
    request(options, function (error, response, body) {

        if (!error && JSON.parse(response.statusCode) === 200) {
                callBack(null,response,body);
            }
            else {
                callBack(error,response,null);
            }
        }
    );
}

function generateGetUrlFromParams(route, params) {
    var options;
    if (params['access_token']) {
        options = {
            url: toornamentApiUrl + route,
            method: 'GET',
            headers: {
                'X-Api-Key': keyApi,
                Authorization: token_tournament
            }
        };
    } else {
        options = {
            url: toornamentApiUrl + route,
            method: 'GET',
            headers: {
                'X-Api-Key': keyApi
            }
        };
    }


    if (Object.keys(params).length > 0) {
        options.url += '?';

        if (params['discipline']) {
            options.url += 'discipline=' + params['discipline'] + '&';
        }
        if (params['archived']) {
            options.url += 'archived=' + params['archived'] + '&';
        }
        if (params['status']) {
            options.url += '&status=' + params['status'] + '&';
        }
        if (params['featured']) {
            options.url += 'featured=' + params['featured'] + '&';
        }
        if (params['online']) {
            options.url += 'online=' + params['online'] + '&';
        }
        if (params['country']) {
            options.url += 'country=' + params['country'] + '&';
        }
        if (params['after_start']) {
            options.url += 'after_start=' + params['after_start'] + '&';
        }
        if (params['before_start']) {
            options.url += 'before_start=' + params['before_start'] + '&';
        }
        if (params['after_end']) {
            options.url += 'after_end=' + params['after_end'] + '&';
        }
        if (params['before_end']) {
            options.url += 'before_end=' + params['before_end'] + '&';
        }
        if (params['name']) {
            options.url += 'name=' + params['name'] + '&';
        }
        if (params['page']) {
            options.url += 'page=' + params['page'] + '&';
        }
        if (params['has_result']) {
            options.url += 'has_result=' + params['has_result'] + '&';
        }
        if (params['stage_number']) {
            options.url += 'stage_number=' + params['stage_number'] + '&';
        }
        if (params['group_number']) {
            options.url += 'group_number=' + params['group_number'] + '&';
        }
        if (params['round_number']) {
            options.url += 'round_number=' + params['round_number'] + '&';
        }
        if (params['participant_id']) {
            options.url += 'participant_id=' + params['participant_id'] + '&';
        }
        if (params['with_games']) {
            options.url += 'with_games=' + params['with_games'] + '&';
        }
        if (params['with_stats']) {
            option.url += 'with_stats=' + params['with_stats'] + '&';
        }
        if (params['tournament_ids']) {
            options.url += '&tournament_ids=' + params['tournament_ids'] + '&';
        }
        options.url = options.url.substring(0, options.url.length - 1);
    }
    logger.info(options);
    return options;
}

// OAUTH2

// https://api.toornament.com/oauth/v2/token
module.exports.oauth2 = function Oauth2(callBack){

    var options = {
        url: toornamentApiUrl + 'oauth/v2/token',
        method: 'POST',
        form: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }
    };

    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// TOURNAMENT

// https://api.toornament.com/v1/tournaments
module.exports.getTournaments = function getTournaments(params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments', params);

    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments
module.exports.addTournament = function postTournament(params,callBack){

    var addTournamentModel = new AddTournamentModel(params['discipline'], params['name'], params['size'], params['participant_type']);

    var options = {
        url: toornamentApiUrl + 'v1/tournaments',
        method: 'POST',
        body: JSON.stringify(addTournamentModel),
        headers: {
            'X-Api-Key': keyApi,
            Authorization: token_tournament
        }
    };

    logger.info('options', options);
    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {
            callBack(   null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

module.exports.insertTournament = function insertTournament(userId, tournamentId) {
    var Tournament = mongoose.model('tournaments',{userId: 'string', tournamentId: 'string'});
    var data = new Tournament({
        _id: new ObjectID(),
        userId: userId,
        tournamentId: tournamentId
    });

    data.save(function (err, data) {
        if (err) console.log(err);
        else console.log('Saved ', data );
    });
};

// https://api.toornament.com/v1/tournaments/{id}
module.exports.getOneTournamentById = function getOneTournamentById(id, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + id, []);

    logger.info(options.url);

    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/me/tournaments
module.exports.getMyTournaments = function getMyTournaments(params, callBack){

    var options = generateGetUrlFromParams('v1/me/tournaments', params);
    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{id}
module.exports.devareOneTournamentById = function devareOneTournamentById(id, params, callBack){

    var options = {
        url: toornamentApiUrl + 'v1/tournaments/' + id,
        method: 'DEvarE',
        headers: {
            'X-Api-Key': keyApi,
            Authorization: token_tournament
        }
    };
    logger.info(options.url);

    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            //callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// MATCHES

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches
module.exports.getMatchesByTournament = function getMatchesByTournament(id, params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + id +'/matches', params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/disciplines/{discipline_id}/matches
module.exports.getMatchesByDiscipline = function getMatchesByDiscipline(id, params, callBack){

    var options = generateGetUrlFromParams( "v1/disciplines/" + id + "/matches", params);
    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches/{id}/result
module.exports.getMatcheByIdAndTournament = function getMatcheByIdAndTournament(idTournament, idMatche, params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + idTournament +'/matches/' + idMatche + '/result', params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches
module.exports.getMatcheResultByIdAndTournament = function getMatcheResultByIdAndTournament(idTournament, idMatche, params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + idTournament +'/matches/' + idMatche, params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/disciplines
module.exports.getDisciplines = function getDisciplines(params, callBack) {

    var options = generateGetUrlFromParams('v1/disciplines', params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// GAMES

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches/{matche_id}/games
module.exports.getGamesByMatchAndTournament = function getGamesByMatchAndTournament(idTournament, idMatch, params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + idTournament +'/matches/' + idMatch +'/games', params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches/{matche_id}/games/{game_id}
module.exports.getGamesByIdAndMatchAndTournament = function getGamesByIdAndMatchAndTournament(idTournament, idMatch, idGame, params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + idTournament +'/matches/' + idMatch +'/games/' + idGame, params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{tournament_id}/matches/{matche_id}/games/{game_id}/result
module.exports.getGamesResultByIdAndMatchAndTournament = function getGamesResultByIdAndMatchAndTournament(idTournament, idMatch, idGame, params, callBack){

    var options = generateGetUrlFromParams('v1/tournaments/' + idTournament +'/matches/' + idMatch +'/games/' + idGame + '/result', params);

    logger.info(options);

    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// PARTICIPANTS

// https://api.toornament.com/v1/tournaments/{tournament_id}/participants
module.exports.getParticipantsByTournamentId = function getParticipantsByTournamentId(idTournament, params, callBack) {

    var options = generateGetUrlFromParams("v1/tournaments/" + idTournament + "/participants", params);

    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};

// https://api.toornament.com/v1/tournaments/{tournament_id}/participants/{id}
module.exports.getParticipantsByTournamentIdAndParticipantId = function getParticipantsByTournamentIdAndParticipantId(idTournament, idParticipant,params, callBack) {

    var options = generateGetUrlFromParams("v1/tournaments/" + idTournament + "/participants/" + idParticipant, params);
    logger.info(options);


    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {

            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};



// https://api.toornament.com/v1/tournaments/{tournaments_id}/participants
module.exports.addParticipant =     function addParticipant(id, params,callBack){

    var addParticipantModel = new AddParticipantModel(params['name'], params['email'], params['country'], params['line_up']);

    var options = {
        url: toornamentApiUrl + 'v1/tournaments/' + id + '/participants',
        method: 'POST',
        body: JSON.stringify(addParticipantModel),
        headers: {
            'X-Api-Key': keyApi,
            Authorization: token_tournament
        }
    };

    logger.info('options', options);
    toornamentApiRequest(options,function (error,response,body) {

        var respObject = JSON.parse(body);
        if (!error && response.statusCode != 404) {
            callBack(null,JSON.parse(response["body"]),respObject);
        }
        else {
            callBack(error,response,null);
        }
    });
};