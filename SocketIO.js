var server,
    http = require('http');


module.exports.initServer = function(app, port, host){
    server = http.createServer(app).listen(port, function (err) {
        if (err) logger.error(err);
        logger.info('The API sample is now running at http://' + host + ':' + port);
    });
    exports.server = server;
};