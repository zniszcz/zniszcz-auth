const request = require('supertest');
const app = require('../app');
const Models = require('../models');

jest.mock('../models', () => ({
    User: {
        findOne: jest.fn(),
    },
}));

describe('Check Login Avaibility route', () => {

    test('should handle request with no data send', (done) => {
        return request(app)
            .get('/checklogin')
            .expect(400)
            .then((response) => {
                const mock = {
                    errors: [
                        {
                            message: 'There\'s no username passed.',
                        },
                    ],
                };
                expect(response.body).toEqual(mock);
                done();
            });
    });

    test('should send information about taken login', (done) => {

        Models.User.findOne.mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });

        return request(app)
            .get('/checklogin')
            .query({
                login: 'SampleLogin',
            })
            .expect(409)
            .then((response) => {
                expect(JSON.parse(response.text)).toEqual({
                    errors: [
                        {
                            message: 'This username is already taken.',
                        },
                    ],
                });
                done();
            });
    });

    test('should send information about free login', (done) => {

        Models.User.findOne.mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(null);
            });
        });

        return request(app)
            .get('/checklogin')
            .query({
                login: 'SampleLogin',
            })
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text)).toEqual({
                    message: 'This username is available.',
                });
                done();
            });
    });

});


describe('Check Mail Avaibility route', () => {

    test('should handle request with no data send', (done) => {
        return request(app)
            .get('/checkmail')
            .expect(400)
            .then((response) => {
                const mock = {
                    errors: [
                        {
                            message: 'There\'s no mail passed.',
                        },
                    ],
                };
                expect(response.body).toEqual(mock);
                done();
            });
    });

    test('should send information about taken mail', (done) => {

        Models.User.findOne.mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });

        return request(app)
            .get('/checkmail')
            .query({
                mail: 'sample.email@adress.com',
            })
            .expect(409)
            .then((response) => {
                expect(JSON.parse(response.text)).toEqual({
                    errors: [
                        {
                            message: 'This mail is already taken.',
                        },
                    ],
                });
                done();
            });
    });

    test('should send information about free mail', (done) => {

        Models.User.findOne.mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(null);
            });
        });

        return request(app)
            .get('/checkmail')
            .query({
                mail: 'SampleLogin',
            })
            .expect(200)
            .then((response) => {
                expect(JSON.parse(response.text)).toEqual({
                    message: 'This mail is available.',
                });
                done();
            });
    });

});
