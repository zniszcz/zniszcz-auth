'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        login: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            min: 4,
            max: 20,
        },
        name: {
            type: DataTypes.STRING(20),
            min: 4,
            max: 20,
        },
        surname: {
            type: DataTypes.STRING(20),
            min: 4,
            max: 20,
        },
        mail: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            min: 4,
            max: 20,
            validate: {
                isEmail: true,
            },
        },
        password: DataTypes.STRING,
        createdAt: {
            type: DataTypes.DATE,
        },
    });
    return User;
};
