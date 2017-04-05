/**
 * Created by tdoret on 05/04/2017.
 */
var sanitizer = require('sanitizer'),
    _ = require('lodash'),
    twitchApiUrl = "https://api.twitch.tv/kraken/",
    keyApi = "kqxqq85g9ushrjr184mp0goxxgk37l",
    request = require('request');


function twitchApiRequest(options,callBack) {
    request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callBack(null,response,body);
            }
            else {
                callBack(error,response,null);
            }
        }
    );
}


//https://api.twitch.tv/kraken/streams/?client_id=kqxqq85g9ushrjr184mp0goxxgk37l
module.exports.getLiveStream = function getLiveStream(callBack) {
    var options = {
        url: twitchApiUrl + 'streams/?client_id=' + keyApi
    };
    twitchApiRequest(options,callBack);
};

//https://api.twitch.tv/kraken/streams/ogaminglol?client_id=kqxqq85g9ushrjr184mp0goxxgk37l
module.exports.getStreamByUserStrict = function getStreamByUserStrict(twitchIdUser,callBack) {
    var options = {
        url: twitchApiUrl + 'streams/'+ twitchIdUser + '?client_id=' + keyApi
    };
    twitchApiRequest(options,callBack);
};

//https://api.twitch.tv/kraken/search/streams?query=ogam&client_id=kqxqq85g9ushrjr184mp0goxxgk37l
module.exports.getStreamByUserPartial = function getStreamByUserStrict(partialTwitchIdUser,callBack) {
    var options = {
        url: twitchApiUrl + 'search/streams?query='+ partialTwitchIdUser + '&client_id=' + keyApi
    };
    twitchApiRequest(options,callBack);
};


