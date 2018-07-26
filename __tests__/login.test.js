const request = require('supertest');
const app = require('../app');
const Models = require('../models');
const crypto = require('crypto');
const salt = require('../config/crypto.json').salt;
const secret = require('../config/crypto.json').secret;
const sessionExpiration = require('../config/crypto.json').sessionExpiration;
const jwt = require('jsonwebtoken');

jest.mock('../models', () => ({
    User: {
        findOne: jest.fn(),
    },
}));

describe('Login route', () => {
    const noPasswordErr = {
        message: 'There\'s no password passed.',
    };
    const noMailNorUsernameErr = {
        message: 'There\'s no username or mail passed.',
    };

    describe('Bad requests', () => {
        test('should handle request with no data send', (done) => {
            return request(app)
                .post('/login')
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            noMailNorUsernameErr,
                            noPasswordErr,
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });


        test('should handle request with no password send', (done) => {
            return request(app)
                .post('/login')
                .send({
                    login: 'SampleUsername2',
                })
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            noPasswordErr,
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });
    });

    describe('Correct requests', () => {

        test('should authorise user when correct login and password are sent', (done) => {
            const mockedUser = {
                login: 'SampleUsername2',
                password: 'SamplePassword',
                mail: 'sample.mail@adress.com',
                name: 'Name',
                surname: 'Surname',
            };

            Models.User.findOne.mockImplementation(() => {
                return new Promise((resolve) => {
                    mockedUser.password = crypto.createHmac('sha512', salt)
                        .update(mockedUser.password)
                        .digest('hex');
                    resolve(mockedUser);
                });
            });

            const mockedToken = jwt.sign({
                data: {
                    User: {
                        login: mockedUser.login,
                        mail: mockedUser.mail,
                        name: mockedUser.name,
                        surname: mockedUser.surname,
                    },
                },
            }, secret, {
                expiresIn: sessionExpiration,
            });

            return request(app)
                .post('/login')
                .send({
                    login: mockedUser.login,
                    password: mockedUser.password,
                })
                .expect(201)
                .then((response) => {

                    expect(JSON.parse(response.text)).toEqual({
                        User: {
                            login: mockedUser.login,
                            mail: mockedUser.mail,
                            token: mockedToken,
                            name: mockedUser.name,
                            surname: mockedUser.surname,
                        },
                    });
                    done();
                });
        });
    });

});
