'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                validate: {
                    min: 4,
                    max: 20,
                },
            },
            login: {
                type: Sequelize.STRING,
                unique: true,
                validate: {
                    min: 4,
                    max: 20,
                },
            },
            name: {
                type: Sequelize.STRING,
                validate: {
                    min: 4,
                    max: 20,
                },
            },
            surname: {
                type: Sequelize.STRING,
                validate: {
                    min: 4,
                    max: 20,
                },
            },
            mail: {
                type: Sequelize.STRING,
                unique: true,
                validate: {
                    min: 4,
                    max: 20,
                },
            },
            password: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('Users');
    },
};
