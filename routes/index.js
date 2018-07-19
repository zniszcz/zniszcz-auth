const router = require('express').Router();
const usersController = require('../controllers').users;

router.get('/', (__req, res) => {
    res.status(200).json({
        message: res.__('Welcome in Authorisation Service.'),
        version: process.env.VERSION,
    });
});

router.post('/login', usersController.authenticate);
router.post('/register', usersController.create);

module.exports = router;
