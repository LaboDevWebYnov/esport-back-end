/**
 * Created by Antoine on 02/03/2016.
 */
var config = require('config'),
    mongoose = require("mongoose"),
    logger = require('log4js').getLogger('controller.utils.sendEmail'),
    ES = config.server.features.email.smtp,
    Mailgun = require('mailgun-js'),
    EM = {};
module.exports = EM;

//TODO refactor code in such a way that we declare mailgun instance and send message only once
EM.dispatchAccountValidationLink = function (user, callback) {
    logger.debug('using config '+JSON.stringify(ES.mailgun));
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun(ES.mailgun.apiKey, ES.mailgun.apiKey);
    logger.debug('creating email for user '+user);

    // send mail
    var data = {
        //Specify email data
        from: ES.sender,
        //The email to contact
        to: user.email,
        //Subject and text data
        subject: 'Email validation',
        html: EM.composeEmailAccountValidation(user) // html body
    };

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            //res.render('error', { error : err});
            logger.error("got an error while sending email: ", err);
            return callback(err);
        }
        //Else we can greet    and leave
        else {
            logger.debug('Message sent' + JSON.stringify(body) + ' to mail:' + user.email);
            callback(null, user);
        }
    });
};

EM.dispatchResetPasswordLink = function (user, token, callback) {
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun(ES.mailgun.apiKey, ES.mailgun.apiKey);

    // send mail
    var data = {
        //Specify email data
        from: ES.sender,
        //The email to contact
        to: user.email,
        //Subject and text data
        subject: 'Password recovery',
        html: EM.composeEmailResetPassword(user, token) // html body
    };

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            //res.render('error', { error : err});
            logger.error("got an error: ", err);
            return callback(err);
        }
        //Else we can greet    and leave
        else {
            logger.debug('Message sent' + JSON.stringify(body) + ' to mail:' + user.email);
            callback(null);
        }
    });
};

EM.dispatchResetPasswordConfirmation = function (user, callback) {
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun(ES.mailgun.apiKey, ES.mailgun.apiKey);

    // send mail
    var data = {
        //Specify email data
        from: ES.sender,
        //The email to contact
        to: user.email,
        //Subject and text data
        subject: 'Password reset confirmation',
        html: EM.composeEmailResetPasswordConfirmation(user) // html body
    };

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            //res.render('error', { error : err});
            logger.error("got an error: ", err);
            return callback(err);
        }
        //Else we can greet    and leave
        else {
            logger.debug('Message sent' + JSON.stringify(body) + ' to mail:' + user.email);
            callback(null);
        }
    });
};

EM.composeEmailAccountValidation = function (o) {
    //todo make a generic link with req.headers.host
    var link = 'http://localhost:3000/api/validate/' + o.email;
    logger.debug('Link created:' + link);
    var html = "<html><body>";
    html += "Hi " + o.firstname + ",<br><br>";
    html += "Your username is : <b>" + o.username + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to validate your account</a><br><br>";
    html += "If you can't click the link, copy/pasterino this in your browser : <b>" + link + "</b><br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    logger.debug('html created:' + html);
    return html;
};

EM.composeEmailResetPassword = function (user, token) {
    //todo make a generic link with req.headers.host
    var link = 'http://localhost:3000/api/reset/' + token;
    logger.debug('Link created:' + link);
    var html = "<html><body>";
    html += "Hi " + user.firstname + ",<br><br>";
    html += "You are receiving this because you (or someone else) have requested the reset of the password for your account.</b><br><br>";
    html += "Please click on the following link, or paste this into your browser to complete the process:<br><br>";
    html += "<a href='" + link + "'>Reset password</a><br><br>";
    html += "If you can't click the link, copy/pasterino this in your browser : <b>" + link + "</b><br><br>";
    html += "If you did not request this, please ignore this email and your password will remain unchanged.<br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    logger.debug('html created:' + html);
    return html;
};

EM.composeEmailResetPasswordConfirmation = function (user) {
    var html = "<html><body>";
    html += "Hi " + user.firstname + ",<br><br>";
    html += "This is a confirmation that the password for your account " + user.email + " has just been changed.</b><br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    logger.debug('html created:' + html);
    return html;
};