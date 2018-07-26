const crypto = require('crypto');
const AbstractController = require('./AbstractController');
const salt = require('../config/crypto.json').salt;
const secret = require('../config/crypto.json').secret;
const sessionExpiration = require('../config/crypto.json').sessionExpiration;
const jwt = require('jsonwebtoken');

module.exports = class UsersController extends AbstractController {
    create(req, res) {
        const errors = [];

        if (!req.body.login) {
            errors.push({
                message: res.__(`There's no username passed.`),
            });
        }

        if (!req.body.mail) {
            errors.push({
                message: res.__(`There's no mail passed.`),
            });
        }

        if (!req.body.password) {
            errors.push({
                message: res.__(`There's no password passed.`),
            });
        }

        if (!req.body.login || !req.body.mail || !req.body.password) {
            return res.status(400).json({
                errors,
            });
        }

        const passHash = crypto.createHmac('sha512', salt)
            .update(req.body.password)
            .digest('hex');

        const user = {
            login: req.body.login.toLowerCase(),
            mail: req.body.mail.toLowerCase(),
            password: passHash,
        };

        if (req.body.name) {
            user.name = req.body.name;
        }

        if (req.body.surname) {
            user.surname = req.body.surname;
        }

        return this.model
            .create(user)
            .then(({
                login,
                mail,
                name = '',
                surname = '',
            }) => {
                const token = jwt.sign({
                    data: {
                        User: {
                            login,
                            mail,
                            name,
                            surname,
                        },
                    },
                }, secret, {
                    expiresIn: sessionExpiration,
                });
                res.status(201).json({
                    message: res.__(`User is created.`),
                    User: {
                        login,
                        mail,
                        token,
                        name,
                        surname,
                    },
                });
            })
            .catch((error) => {
                const dictionary = {
                    'mail must be unique': 'You already have an account in portal. Use password reminder.',
                    'login must be unique': 'This username is already taken.',
                    'Validation isEmail on mail failed': 'Email adress is not correct.',
                };
                let errors;
                if (error.errors && error.errors.length) {
                    errors = error.errors.map(({
                        message,
                    }) => ({
                        message: res.__(dictionary[message] || message),
                    }));
                } else {
                    errors = [
                        error,
                    ];
                }
                res.status(400).json({
                    errors,
                });
            });
    }
    authenticate(req, res) {
        const errors = [];

        if (!req.body.mail && !req.body.login) {
            errors.push({
                message: res.__(`There's no username or mail passed.`),
            });
        }

        if (!req.body.password) {
            errors.push({
                message: res.__(`There's no password passed.`),
            });
        }

        if ((!req.body.login && !req.body.mail) || !req.body.password) {
            return res.json({
                errors,
            });
        }

        const userAuthorise = ({
            login,
            mail,
            password,
            name,
            surname,
        }) => {
            const passHash = crypto.createHmac('sha512', salt)
                .update(req.body.password)
                .digest('hex');

            if (password === passHash) {
                const token = jwt.sign({
                    data: {
                        User: {
                            login,
                            mail,
                            name,
                            surname,
                        },
                    },
                }, secret, {
                    expiresIn: sessionExpiration,
                });
                res.status(201).json({
                    User: {
                        login,
                        mail,
                        token,
                        name,
                        surname,
                    },
                });
            } else {
                res.status(401).json({
                    errors: [{
                        message: res.__(`Password is invalid.`),
                    }],
                });
            }
        };

        const handleUserNotFound = () => {
            res.status(400).json({
                errors: [{
                    message: (req.body.login) ?
                        res.__(`There's no user with this username on database.`) : res.__(`There's no user with this mail on database.`),
                }],
            });
        };

        return this.model
            .findOne({
                where: (req.body.login) ? {
                    login: req.body.login.toLowerCase(),
                } : {
                    mail: req.body.mail.toLowerCase(),
                },
            })
            .then(userAuthorise)
            .catch(handleUserNotFound);
    }
    checkLoginAvailability(req, res) {
        if (req.body.login) {
            return this.model
                .findOne({
                    where: {
                        login: req.body.login.toLowerCase(),
                    },
                })
                .then((user) => {
                    if (user === null) {
                        res.status(200).json({
                            message: res.__('This username is available.'),
                        });
                    } else {
                        res.status(409).json({
                            errors: [{
                                message: res.__('This username is already taken.'),
                            }],
                        });
                    }
                });
        }
        return res.status(400).json({
            errors: [{
                message: res.__(`There's no username passed.`),
            }],
        });
    }
    checkMailAvailability(req, res) {
        if (req.body.mail) {
            return this.model
                .findOne({
                    where: {
                        mail: req.body.mail.toLowerCase(),
                    },
                })
                .then((user) => {
                    if (user === null) {
                        res.status(200).json({
                            message: res.__('This email is available.'),
                        });
                    } else {
                        res.status(409).json({
                            errors: [{
                                message: res.__('This email is already taken.'),
                            }],
                        });
                    }
                });
        }
        return res.status(400).json({
            errors: [{
                message: res.__(`There's no mail passed.`),
            }],
        });
    }
};
