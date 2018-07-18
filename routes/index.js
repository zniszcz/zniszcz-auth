const router = require('express').Router();
const usersController = require('../controllers').users;
const fs = require('fs');

const VERSION = fs.readFileSync('./.VERSION')
    .toString();

router.get('/', (__req, res) => {
    res.status(200).json({
        msg: 'Welcome in Authorisation Service',
        version: VERSION,
    });
});

router.post('/login', usersController.authenticate);
router.post('/register', usersController.create);

module.exports = router;
