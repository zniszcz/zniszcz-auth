const crypto = require('crypto');
const User = require('../models').User;
const salt = require('../config/crypto.json').salt;
const secret = require('../config/crypto.json').secret;
const sessionExpiration = require('../config/crypto.json').sessionExpiration;
const jwt = require('jsonwebtoken');

module.exports = {
    create(req, res) {
        const errors = [];

        if (!req.body.name) {
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

        if (!req.body.name || !req.body.mail || !req.body.password) {
            return res.json({
                errors,
            });
        }

        const passHash = crypto.createHmac('sha512', salt)
            .update(req.body.password)
            .digest('hex');

        return User
            .create({
                name: req.body.name,
                mail: req.body.mail,
                password: passHash,
            })
            .then(({name, mail}) => {
                const token = jwt.sign({
                    data: {
                        User: {
                            name,
                            mail,
                        },
                    },
                }, secret, {expiresIn: sessionExpiration});
                res.status(201).json({
                    message: res.__(`User is created.`),
                    User: {
                        name,
                        mail,
                        token,
                    },
                });
            })
            .catch((error) => {
                const dictionary = {
                    'mail must be unique': 'You already have an account in portal. Use password reminder.',
                    'Validation isEmail on mail failed': 'Email adress is not correct',
                };
                const errors = error.errors.map(({message}) => ({
                    message: res.__(dictionary[message] || message),
                }));
                res.status(400).json({
                    errors,
                });
            });
    },
    authenticate(req, res) {
        const errors = [];

        if (!req.body.mail && !req.body.name) {
            errors.push({
                message: res.__(`There's no username or mail passed.`),
            });
        }

        if (!req.body.password) {
            errors.push({
                message: res.__(`There's no password passed.`),
            });
        }

        if ((!req.body.name && !req.body.mail) || !req.body.password) {
            return res.json({
                errors,
            });
        }

        const userAuthorise = ({name, mail, password}) => {
            const passHash = crypto.createHmac('sha512', salt)
                .update(req.body.password)
                .digest('hex');

            if (password === passHash) {
                const token = jwt.sign({
                    data: {
                        User: {
                            name,
                            mail,
                        },
                    },
                }, secret, {expiresIn: sessionExpiration});
                res.status(201).json({
                    User: {
                        name,
                        mail,
                        token,
                    },
                });
            } else {
                res.status(401).json({
                    errors: [{
                        message: res.__(`Password is invalid`),
                    }],
                });
            }
        };

        const handleUserNotFound = () => {
            res.status(400).json({
                errors: [{
                    message: (req.body.name)
                        ? res.__(`There's no user with this username on database.`)
                        : res.__(`There's no user with this mail on database.`),
                }],
            });
        };

        return User
            .findOne({
                where: (req.body.name)
                    ? {name: req.body.name}
                    : {mail: req.body.mail},
            })
            .then(userAuthorise)
            .catch(handleUserNotFound);
    },
};
