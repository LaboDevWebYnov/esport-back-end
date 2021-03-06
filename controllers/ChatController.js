var logger = require('log4js').getLogger('controller.toornament'),
    mongoose = require('mongoose'),
    ObjectID = mongoose.Types.ObjectId,
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    Chats = mongoose.model('Chats',{user1: 'string', user2: 'string'}),
    Messages = mongoose.model('Messages',{autor: 'string', content: 'string', created_at: 'Date', chat: 'string'});


module.exports.addChat = function addChat(req, res, next) {
    logger.info('Adding a new chat...');

    var user1 = req.body.user1;
    var user2 = req.body.user2;

    console.log("user1 :", user1);
    console.log("user2 :", user2);
    var data = new Chats({
        _id: new ObjectID(),
        user1: user1,
        user2: user2
    });

    data.save(function (err, data) {
        if (err) {
            return next(err);
        }
        else if (_.isNull(data) || _.isEmpty(data)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(data || {}, null, 2);
        }
        else {
            logger.debug(data);
            res.set('Content-Type', 'application/json');
            res.status(200).json(data || {}, null, 2);
        }
    });
};

module.exports.addMessage = function addMessage(autor, msg, chatId) {
    logger.info('Adding a new message...');


    var data = new Messages({
        _id: new ObjectID(),
        autor: autor,
        content: msg,
        created_at: new Date(),
        chat: new ObjectID(chatId)
    });

    data.save(function (err, data) {
        if (err) console.log(err);
        else console.log('Saved ', data );
    });
};

module.exports.getChatByUser1 = function getChatByUser1(req, res, next) {
    logger.info('Getting chat by user 1...');

    var user = decodeURIComponent(Util.getPathParams(req)[3]);
    console.log("user :", user);
    Chats.find({"user1": user}).select({"_id": 1, "user1": 1, "user2": 1})
        .exec((function (err, chat) {
        if (err) return next(err);
        else res.send(chat);
    }));

};

module.exports.getChatByUser2 = function getChatByUser2(req, res, next) {
    logger.info('Getting chat by user 2...');

    var user = decodeURIComponent(Util.getPathParams(req)[3]);
    console.log("user :", user);
    Chats.find({"user2": user}).select({"_id": 1, "user1": 1, "user2": 1})
        .exec((function (err, chat) {
        if (err) return next(err);
        else res.send(chat);
    }));
};

module.exports.getMessageByChat = function getMessageByChat(req, res, next) {
    logger.info('Getting messages from chat...');

    var chat_id = decodeURIComponent(Util.getPathParams(req)[3]);
    console.log("chat :", chat_id);
    Messages.find({"chat": ObjectID(chat_id)}).select({"_id": 1, "autor": 1, "content": 1, "chat": 1, "created_at": 1})
        .exec((function (err, chat) {
        if (err) return next(err);
        else res.send(chat);
    }));
};