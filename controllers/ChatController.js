var Promise = require("bluebird"),
    logger = require('log4js').getLogger('controller.toornament'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    Util = require('./utils/util.js'),
    Chats = mongoose.model('Chats',{user1: 'string', user2: 'string'}),
    chatService = require('../services/ChatService'),
    Messages = mongoose.model('Messages',{autor: 'string', content: 'string', created_at: 'Date', chat: 'string'});


module.exports.addChat = function addChat(req, res, next) {
    logger.info('Adding a new chat...');

    var user1 = req.query.user1;
    var user2 = req.query.user2;

    chatService.insertChat(user1, user2, function(err, chat){
        if (err) {
            return next(err);
        }
        else if (_.isNull(chat) || _.isEmpty(chat)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(chat || {}, null, 2);
        }
        else {
            logger.debug(chat);
            res.set('Content-Type', 'application/json');
            res.status(200).json(chat || {}, null, 2);
        }
    });
};

module.exports.addMessage = function addMessage(req, res, next) {
    logger.info('Adding a new message...');

    var autor = req.body.autor;
    var contentMsg = req.body.content;
    var chatId = req.body.chat_id;

    chatService.insertMessage(autor, contentMsg, chatId, function(err, chat){
        if (err) {
            return next(err);
        }
        else if (_.isNull(chat) || _.isEmpty(chat)) {
            res.set('Content-Type', 'application/json');
            res.status(404).json(chat || {}, null, 2);
        }
        else {
            logger.debug(chat);
            res.set('Content-Type', 'application/json');
            res.status(200).json(chat || {}, null, 2);
        }
    });
};

module.exports.getChatByUser1 = function getChatByUser1(req, res, next) {
    logger.info('Getting chat by user 1...');

    var user = decodeURIComponent(Util.getPathParams(req)[3]);
    console.log("user :", user);
    var query = Chats.find({"user1": user}).select({"_id": 1, "user1": 1, "user2": 1});
    query.exec((function (err, chat) {
        if (err) return next(err);
        else res.send(chat);
    }));

};

module.exports.getChatByUser2 = function getChatByUser2(req, res, next) {
    logger.info('Getting chat by user 2...');

    var user = decodeURIComponent(Util.getPathParams(req)[3]);
    console.log("user :", user);
    var query = Chats.find({"user1": user}).select({"_id": 1, "user1": 1, "user2": 1});
    query.exec((function (err, chat) {
        if (err) return next(err);
        else res.send(chat);
    }));
};

module.exports.getMessageByChat = function getMessageByChat(req, res, next) {
    logger.info('Getting messages from chat...');

    var chat_id = decodeURIComponent(Util.getPathParams(req)[3]);
    console.log("user :", user);
    var query = Messages.find({"chat": chat_id}).select({"_id": 1, "autor": 1, "content": 1, "chat": 1});
    query.exec((function (err, chat) {
        if (err) return next(err);
        else res.send(chat);
    }));
};