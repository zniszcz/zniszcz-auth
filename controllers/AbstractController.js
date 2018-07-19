const secret = require('../config/crypto.json').secret;
const jwt = require('jsonwebtoken');

module.exports = class AbstractController {
    secure(req, res, next) {
        const token = req.get('x-access-token');
        if (token) {
            return jwt.verify(token, secret, (error, decodedToken) => {
                if (error && error.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        errors: [{
                            message: res.__('Token expired.'),
                        }],
                    });
                } else if (error || !decodedToken) {
                    return res.status(400).json({
                        errors: [{
                            message: res.__('Token is incorrect.'),
                        }],
                    });
                }

                return next();
            });
        }
        return res.status(401).json({
            errors: [{
                message: res.__('You are trying achieve secured content.'),
            }],
        });
    }
};
