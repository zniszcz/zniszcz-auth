const router = require('express').Router();
const usersController = require('../controllers').users;

router.get('/', (__req, res) => {
    res.status(200).json({
        message: res.__('Welcome in Authorisation Service.'),
        version: process.env.CURRENT_VERSION,
    });
});

router.post('/login', usersController.authenticate);
router.post('/register', usersController.create);
router.post('/checklogin', usersController.checkLoginAvailability);
router.post('/checkmail', usersController.checkMailAvailability);

router.get('/user', usersController.secure, (__req, res) => {
    res.json({
        message: 'sample secured content',
    });
});

module.exports = router;
