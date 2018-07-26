const request = require('supertest');
const app = require('../app');
const Models = require('../models');
const childProcess = require('child_process');

jest.mock('../models', () => ({
    User: {
        create: jest.fn().mockImplementation((user) => {
            return new Promise((resolve, reject) => {
                resolve({
                    login: user.login,
                    mail: user.mail,
                    name: '',
                    surname: '',
                });
            });
        }),
        findOne: jest.fn(),
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

    describe('Bad requests', () => {
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
    });

    describe('Correct requests', () => {
        beforeAll((done) => {
            childProcess.execSync(`
                npm run sequelize db:migrate:undo:all &&
                npm run sequelize db:migrate
            `);
            done();
        });

        afterAll((done) => {
            childProcess.execSync(`
                npm run sequelize db:migrate:undo:all
            `);
            done();
        });

        test('should create user when request is correct', (done) => {
            return request(app)
                .post('/register')
                .send({
                    mail: 'sample@email.adress.com',
                    login: 'SampleUsername2',
                    password: 'SamplePassword',
                })
                .expect(201)
                .then((response) => {
                    expect(Models.User.create).toHaveBeenCalledTimes(1);
                    done();
                });
        });
    });

});
