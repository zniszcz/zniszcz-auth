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
            .then((user) => res.status(201).send(user))
            .catch((error) => res.status(400).send(error));
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

        const userAuthorise = (user) => {
            const passHash = crypto.createHmac('sha512', salt)
                .update(req.body.password)
                .digest('hex');

            if (user.password === passHash) {
                const token = jwt.sign({
                    data: {
                        user: {
                            name: user.name,
                            mail: user.mail,
                        },
                    },
                }, secret, {expiresIn: sessionExpiration});
                res.status(201).json({
                    user: {
                        name: user.name,
                        mail: user.mail,
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
