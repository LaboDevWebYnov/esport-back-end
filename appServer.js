var server;

module.exports.initServer = function initServer(){
    http.createServer(app).listen(port, function (err) {
        if (err) logger.error(err);
        logger.info('The API sample is now running at http://' + host + ':' + port);
    });
};
