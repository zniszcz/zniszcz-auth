const request = require('supertest');
const app = require('../app');
const Models = require('../models');

jest.mock('../models', () => ({
    User: {
        create: jest.fn().mockImplementation((user) => {
            return new Promise((resolve) => {
                resolve({
                    login: user.login,
                    mail: user.mail,
                    name: user.name || '',
                    surname: user.surname || '',
                });
            });
        }),
    },
}));

describe('Register route', () => {
    const noUsernameErr = {
        message: 'There\'s no username passed.',
    };
    const noMailErr = {
        message: 'There\'s no mail passed.',
    };
    const noPasswordErr = {
        message: 'There\'s no password passed.',
    };

    describe('Correct requests', () => {

        test('should create user when request is correct', (done) => {
            Models.User.create = jest.fn().mockImplementation((user) => {
                return new Promise((resolve) => {
                    resolve({
                        login: user.login,
                        mail: user.mail,
                        name: user.name || '',
                        surname: user.surname || '',
                    });
                });
            });

            return request(app)
                .post('/register')
                .send({
                    mail: 'sample@email.adress.com',
                    login: 'SampleUsername2',
                    password: 'SamplePassword',
                })
                .expect(201)
                .then(() => {
                    expect(Models.User.create).toHaveBeenCalledTimes(1);
                    done();
                });
        });

        test('should save name and surname when passed', (done) => {
            return request(app)
                .post('/register')
                .send({
                    name: 'Name',
                    surname: 'Surname',
                    mail: 'sample@email.adress.com',
                    login: 'SampleUsername2',
                    password: 'SamplePassword',
                })
                .expect(201)
                .then((response) => {
                    expect(response.body.User.name).toBe('Name');
                    expect(response.body.User.surname).toBe('Surname');
                    done();
                });
        });
    });

    describe('Bad requests', () => {

        afterAll(() => {
            jest.clearAllMocks();
        });

        test('should handle request with no data send', (done) => {
            return request(app)
                .post('/register')
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            noUsernameErr,
                            noMailErr,
                            noPasswordErr,
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });

        test('should handle request with no username send', (done) => {
            return request(app)
                .post('/register')
                .send({
                    mail: 'sample@email.adress.com',
                    password: 'SamplePassword123!',
                })
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            noUsernameErr,
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });

        test('should handle request with no mail send', (done) => {
            return request(app)
                .post('/register')
                .send({
                    login: 'sampleUsername1',
                    password: 'SamplePassword123!',
                })
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            noMailErr,
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });

        test('should handle request with no password send', (done) => {
            return request(app)
                .post('/register')
                .send({
                    mail: 'sample@email.adress.com',
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

        test('should handle request with incorrect mail', (done) => {

            Models.User.create.mockImplementation(() => {
                return new Promise((__resolve, reject) => {
                    reject({
                        errors: [
                            {
                                message: 'Validation isEmail on mail failed',
                            },
                        ],
                    });
                });
            });

            return request(app)
                .post('/register')
                .send({
                    mail: 'wrong email adress',
                    login: 'SampleUsername2',
                    password: 'SamplePassword2!',
                })
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            {
                                message: 'Email adress is not correct.',
                            },
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();
                });
        });

        test('should handle taken mail registring try', (done) => {

            Models.User.create.mockImplementation(() => {
                return new Promise((__resolve, reject) => {
                    reject({
                        errors: [
                            {
                                message: 'mail must be unique',
                            },
                        ],
                    });
                });
            });

            return request(app)
                .post('/register')
                .send({
                    mail: 'sample@used.mail.com',
                    login: 'SampleUsername2',
                    password: 'SamplePassword2!',
                })
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            {
                                message: 'You already have an account in portal. Use password reminder.',
                            },
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();

                });
        });

        test('should handle taken username registring try', (done) => {

            Models.User.create.mockImplementation(() => {
                return new Promise((__resolve, reject) => {
                    reject({
                        errors: [
                            {
                                message: 'login must be unique',
                            },
                        ],
                    });
                });
            });

            return request(app)
                .post('/register')
                .send({
                    mail: 'wrong email adress',
                    login: 'SampleUsername2',
                    password: 'SamplePassword2!',
                })
                .expect(400)
                .then((response) => {
                    const mock = {
                        errors: [
                            {
                                message: 'This username is already taken.',
                            },
                        ],
                    };
                    expect(response.body).toEqual(mock);
                    done();

                });
        });
    });
});
