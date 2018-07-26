const router = require('express').Router();
const usersController = require('../controllers').users;

router.get('/', (__req, res) => {
    res.status(200).json({
        message: res.__('Welcome in Authorisation Service.'),
        version: process.env.CURRENT_VERSION,
    });
});

router.post('/login', usersController.authenticate.bind(usersController));
router.post('/register', usersController.create.bind(usersController));
router.get('/checklogin', usersController.checkLoginAvailability.bind(usersController));
router.get('/checkmail', usersController.checkMailAvailability.bind(usersController));

router.get('/user', usersController.secure, (__req, res) => {
    res.json({
        message: res.__('Sample secured content.'),
    });
});

module.exports = router;
