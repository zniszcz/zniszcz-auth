const Users = require('./Users');
const UserModel = require('../models').User;

module.exports = {
    users: new Users(UserModel),
};
