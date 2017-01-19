/**
 * Created by Antoine on 02/03/2016.
 */
var crypto = require('crypto');
var logger = require('log4js').getLogger('service.security.crypt');

var algorithm = 'aes-256-ctr';
var password = '9595csapoRMLqwcscuUYHEBCJQ';

var format = 'utf8';
var hex = 'hex';

module.exports.encrypt = function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, format, hex);
    crypted += cipher.final(hex);
    return crypted;
};

module.exports.decrypt = function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, hex, format);
    dec += decipher.final(format);
    logger.debug('Deciphered: ' + dec);
    return dec;
};