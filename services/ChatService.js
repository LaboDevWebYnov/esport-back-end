var mongoose = require('mongoose'),
    ObjectID = mongoose.Types.ObjectId,
    Promise = require("bluebird"),
    sanitizer = require('sanitizer'),
    _ = require('lodash');

mongoose.Promise = Promise;

module.exports.insertChat = function insertChat(user1, user2) {
    var data = new Chats({
        _id: new ObjectID(),
        user1: user1,
        user2: user2
    });

    data.save(function (err, data) {
        if (err) console.log(err);
        else console.log('Saved ', data );
    });
};

module.exports.insertMessage = function insertMessage(autor, msg, chat_id, callback) {
    var data = new Messages({
        _id: new ObjectID(),
        autor: autor,
        content: msg,
        created_at: new Date(),
        chat: new ObjectID(chat_id)
    });

    data.save(function (err, data) {
        if (err) console.log(err);
        else {
            console.log('Saved ', data );
            callback(data);
        }
    });
};