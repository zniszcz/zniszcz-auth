'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        mail: DataTypes.STRING,
        password: DataTypes.STRING,
    });
    return User;
};
