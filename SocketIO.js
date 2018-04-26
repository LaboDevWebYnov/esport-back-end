var server,
    http = require('http'),
    chatController = require('./controllers/ChatController');


module.exports.initServer = function(app, port, host){
    server = http.createServer(app).listen(port, function (err) {
        if (err) logger.error(err);
        logger.info('The API sample is now running at http://' + host + ':' + port);
    });
    app.get('/socket.io/', function(req, res){
        res.sendfile('indexChat.html');
    });
    app.post('/socket.io/', function(req, res){
        res.sendfile('indexChat.html');
    });
    exports.server = server;

    //---------------------------------------------------------------------------------------

    var io = require('socket.io').listen(server);

    var users = []; //List users

    io.sockets.on('connection', function(socket){
        console.log("socket connection");
        var emit = function(emitCmd, data, socketId){

            if (socketId !== undefined) {
                if (socket.room !== undefined) {
                    socket.in(socket.room).broadcast.to(socketId).emit(emitCmd, data);
                } else {
                    io.to(socketId).emit(emitCmd, data);
                }
            } else {
                if (socket.room !== undefined) {
                    socket.in(socket.room).broadcast.emit(emitCmd, data);
                } else {
                    socket.broadcast.emit(emitCmd, data);
                }
            }
        };

        socket.on('user-login', function(loggedUser){
            socket.user = loggedUser;
            logger.info('loged');
        });

        socket.on("join-room", function(data) {
            logger.info(data.username + " try to join room " + data.room)
            if (data.room === null || data.room === undefined) {
                return;
            }

            if (socket.room !== undefined) {
                socket.leave(socket.room);
                socket.room = undefined;
            }

            if (data.username !== null || data.username !== undefined) {
                socket.username = data.username;
            }

            socket.join(data.room);
            socket.room = data.room;

            if (socket.username !== undefined) {
                emit("user.joined", {
                    username: socket.username,
                    room: socket.room
                });
                users.push({username: data.username, room: data.room, origin: 'WEB'});
            }
        });

        socket.on("chat-message", function(data){

            logger.info(data.username + " send " + data.message);
            var trUid = socket.room.replace('room_', '');
            var msg = data.message;

            //Je met à undefined le socket pour renvoyer le message à l'utilisateur qui l'a envoyé
            var socketId = socket.id;
            socket.id = undefined;

            emit("return-chat-message", {
                room: socket.room,
                autor: data.username,
                created_at: new Date(),
                content: msg
            });

            var roomId = socket.room;
            socket.room = undefined;

            logger.info('set read notification for others users');

            emit("check.notification", {
                transportUid: trUid,
                username: data.username
            });

            //Je reset le socket pour ne pas créer d'incohérence pour le reste
            socket.id = socketId;
            socket.room = roomId;

            chatController.addMessage(data.username, data.message, socket.room);
        });

        socket.on('disconnect', function(){
            logger.info('user disconnected');
            socket.leave(socket.room);
            socket.removeAllListeners('chat-message');
        });

        socket.on("typing", function() {
            if (socket.username !== undefined) {
                emit("typing", {
                    username: socket.username,
                    room: socket.room
                });
            }
        });

        socket.on("stop-typing", function() {
            if (socket.username !== undefined) {
                emit("stop-typing", {
                    username: socket.username
                });
            }
        });
    });

};