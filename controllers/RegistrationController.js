// Path : GET api/register/step0/{email}
//todo need to refactor front-end and registration logic
module.exports.registerUserEmail = function registerUserEmail(req, res, next) {
    return res.status(501).end(JSON.stringify('Not implemented yet' || {}, null, 2));

    logger.debug('Original url: ' + req.originalUrl);
    // logger.info('Verifying email '+ decodeURIComponent(req.params.email));
    logger.debug('email: ' + decodeURIComponent(Util.getPathParams(req)[3]));
    logger.debug('token: ' + req.query.t);
    var email = decodeURIComponent(Util.getPathParams(req)[3]);
    var token = req.query.t;

    //recherche d'un user avec: cet email, le token correspondant et un token ayant une date de fin de validité > now
    User.find({
        email: email,
        accValidationToken: token,
        accValidationTokenExpires: {$gt: moment()}
    }, function (err, user) {
        if (err) return next(err);
        else {
            //todo handle redirecting
            //check if a user with the provided email is in DB
            if (user.length) {
                var members = [
                    {
                        address: email
                    }
                ];
                //create a mailing list on mailgun.com/cp/lists and put its address below
                //add email to validated emails list
                mailgun.lists('accountregistration@sandboxac05877c9fb5494eabcee21e7eaafd61.mailgun.org').members().add({
                    members: members,
                    subscribed: true
                }, function (err, body) {
                    logger.debug('Response from mailgun:' + JSON.stringify(body));
                    if (err) {
                        logger.error('Error while registering user to email list: ' + err);
                        return next(err);
                    }
                    else {
                        User.findOneAndUpdate(
                            {
                                email: email
                            },
                            {
                                $set: {
                                    verified: true
                                },
                                $unset: {
                                    accValidationToken: '',
                                    accValidationTokenExpires: ''
                                }
                            },
                            {new: true}, //means we want the DB to return the updated document instead of the old one
                            function (err, updatedUser) {
                                if (err) {
                                    logger.error('Error while updating user verified attr: ' + err);
                                    return next(err);
                                }
                                else {
                                    res.set('Content-Type', 'application/json');
                                    res.status(200).end(JSON.stringify(updatedUser._doc || {}, null, 2));
                                    // res.redirect('/register/step1');
                                }
                            });
                    }
                });
            }
            //no user found in the DB with this email, aborting
            else {
                res.set('Content-Type', 'application/json');
                res.status(401).end(JSON.stringify({error: 'Demande de création de compte invalide ou expirée ! Merci de bien vouloir vour réinscrire ici. (lien à mettre)'}, null, 2));
            }
        }
    });
};