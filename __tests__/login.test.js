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

        test('should handle wrong password sent', (done) => {
            Models.User.findOne.mockImplementation(() => {
                return new Promise((resolve) => {
                    resolve({
                        password: 'Some random not valid hash',
                    });
                });
            });

            return request(app)
                .post('/login')
                .send({
                    login: 'SampleUsername2',
                    password: 'Some-other-password2!',
                })
                .expect(401)
                .then((response) => {
                    const mock = {
                        errors: [
                            {
                                message: 'Password is invalid.',
                            },
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });
    });

    describe('Correct requests', () => {

        const mockedUser = {
            login: 'SampleUsername2',
            password: 'SamplePassword',
            mail: 'sample.mail@adress.com',
            name: 'Name',
            surname: 'Surname',
        };

        beforeAll(() => {
            Models.User.findOne.mockImplementation(() => {
                return new Promise((resolve) => {
                    mockedUser.password = crypto.createHmac('sha512', salt)
                        .update(mockedUser.password)
                        .digest('hex');
                    resolve(mockedUser);
                });
            });
        });

        test('should authorise user when correct login and password are sent', () => {
            return request(app)
                .post('/login')
                .send({
                    login: mockedUser.login,
                    password: mockedUser.password,
                })
                .expect(201);
        });

        test('should return user model after correct authorisation', (done) => {
            return request(app)
                .post('/login')
                .send({
                    login: mockedUser.login,
                    password: mockedUser.password,
                })
                .then((response) => {
                    expect(response.body).toMatchObject({
                        User: {
                            login: mockedUser.login,
                            mail: mockedUser.mail,
                            name: mockedUser.name,
                            surname: mockedUser.surname,
                        },
                    });
                    done();
                });
        });

        test('should return correct token after correct authorisation', (done) => {
            return request(app)
                .post('/login')
                .send({
                    login: mockedUser.login,
                    password: mockedUser.password,
                })
                .then((response) => {
                    const body = JSON.parse(response.text);
                    const token = body.User.token;
                    jwt.verify(token, secret, (error) => {
                        expect(error).not.toBeTruthy();
                        done();
                    });
                });
        });
    });

    describe('Protected routes', () => {

        const mockedUser = {
            login: 'SampleUsername2',
            password: 'SamplePassword',
            mail: 'sample.mail@adress.com',
            name: 'Name',
            surname: 'Surname',
        };

        test('should not show authorised content with no token send', (done) => {
            return request(app)
                .get('/user')
                .expect(401)
                .then((response) => {
                    expect(response.body).toEqual({
                        errors: [
                            {
                                message: 'You are trying achieve secured content.',
                            },
                        ],
                    });
                    done();
                });
        });

        test('should not show authorised content with incorrect token send', (done) => {
            return request(app)
                .get('/user')
                .set('x-access-token', 'wrong.jwt.token')
                .expect(400)
                .then((response) => {
                    expect(response.body).toEqual({
                        errors: [
                            {
                                message: 'Token is incorrect.',
                            },
                        ],
                    });
                    done();
                });
        });

        test('should not show authorised content with expired token send', (done) => {
            const token = jwt.sign({
                data: {
                    User: {
                        login: mockedUser.login,
                        mail: mockedUser.mail,
                        name: mockedUser.name,
                        surname: mockedUser.surname,
                    },
                },
            }, secret, {
                expiresIn: 1,
            });

            return setTimeout(() => {
                request(app)
                    .get('/user')
                    .set('x-access-token', token)
                    .expect(401)
                    .then((response) => {
                        expect(response.body).toEqual({
                            errors: [
                                {
                                    message: 'Token expired.',
                                },
                            ],
                        });
                        done();
                    });
            }, 2000);
        });

        test('should show authorised content with correct token send', (done) => {

            const token = jwt.sign({
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
                .get('/user')
                .set('x-access-token', token)
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual({
                        message: 'Sample secured content.',
                    });
                    done();
                });
        });
    });

});
