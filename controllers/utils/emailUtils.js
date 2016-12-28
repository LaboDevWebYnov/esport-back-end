/**
 * Created by Antoine on 02/03/2016.
 */
var config = require('config'),
		mongoose = require("mongoose"),
		logger = require('log4js').getLogger('controller.utils.sendEmail'),
		ES = config.server.features.email.smtp,
		mailgun = require('mailgun-js')({apiKey: ES.mailgun.apiKey, domain: ES.mailgun.domain}),
		EM = {};
module.exports = EM;

/**
 *
 * @param mailOpts - object containing protocol, host and port for composing the email
 * @param user - the user object containing the user information to compose the email
 * @param token - the token to pass and verify when getting on the first step of the registration
 * @param callback - callback with null if everything went good, with error otherwise
 */
EM.dispatchAccountValidationLink = function (mailOpts, user, token, callback) {
		logger.debug('creating AccountValidationLink email for user ' + user);
		// send mail
		var data = {
				//Specify email data
				from: ES.sender,
				//The email to contact
				to: user.email,
				//Subject and text data
				subject: 'Email validation',
				html: EM.composeEmailAccountValidation(mailOpts, user, token) // html body
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

/**
 *
 * @param mailOpts - object containing protocol, host and port for composing the email
 * @param user - the user object containing the user information to compose the email
 * @param token - the token to pass and verify when getting on the first step of the registration
 * @param callback - callback with null if everything went good, with error otherwise
 */
EM.dispatchResetPasswordLink = function (mailOpts, user, token, callback) {
		// send mail
		var data = {
				//Specify email data
				from: ES.sender,
				//The email to contact
				to: user.email,
				//Subject and text data
				subject: 'Password recovery',
				html: EM.composeEmailResetPassword(mailOpts, user, token) // html body
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

/**
 * @description dispatch reset password confirmation function, used after reset password was successful
 * @param user - the user object containing the user information to compose the email
 * @param callback - callback with null if everything went good, with error otherwise
 */
EM.dispatchResetPasswordConfirmation = function (user, callback) {
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

/**
 * Emails composition
 **/

/**
 * @description account validation email composition
 * @param mailOpts - object containing protocol, host and port for composing the email
 * @param user - the user object containing the user information to compose the email
 * @param token - the token to pass and verify when getting on the first step of the registration
 * @returns {string} - HTML generated
 */
EM.composeEmailAccountValidation = function (mailOpts, user, token) {
		var link = mailOpts.protocol + '://' + mailOpts.host + ':' + mailOpts.port + '/verifyUserEmail/' + user.email + '?t=' + token;
		logger.debug('Link created:' + link);
		var html = "<html><body>";
		html += "Welcome to No Name Gaming !<br><br>";
		html += "Please click on following link to activate your account.<br>";
		html += "<a href='" + link + "'>" + link + "</a><br><br>";
		html += "If you can't click the link, copy/pasterino this in your browser : <b>" + link + "</b><br><br>";
		html += "Have fun on No Name Gaming.<br>";
		html += "</body></html>";
		logger.debug('html created:' + html);
		return html;
};

/**
 * @description recovery password email composition
 * @param mailOpts - object containing protocol, host and port for composing the email
 * @param user - the user object containing the user informations to compose the email
 * @param token - the token to pass and verify when getting on the first step of the registration
 * @returns {string} - HTML generated
 */
EM.composeEmailResetPassword = function (mailOpts, user, token) {
		var link = mailOpts.protocol + '://' + mailOpts.host + ':' + mailOpts.port + '/api/reset/' + token;
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

/**
 * @description successful password reset email composition
 * @param user - the user object containing the user informations to compose the email
 * @returns {string} - HTML generated
 */
EM.composeEmailResetPasswordConfirmation = function (user) {
		var html = "<html><body>";
		html += "Hi " + user.firstname + ",<br><br>";
		html += "This is a confirmation that the password for your account " + user.email + " has just been changed.</b><br><br>";
		html += "Cheers,<br>";
		html += "</body></html>";
		logger.debug('html created:' + html);
		return html;
};