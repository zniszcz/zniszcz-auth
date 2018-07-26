const request = require('supertest');
const app = require('../app');
const locale = require('../locale');

const CURRENT_VERSION = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

describe('HealthCheck', () => {

    test('should response GET method', () => {
        return request(app)
            .get('/')
            .expect(200);
    });

    test('should have information about application version', (done) => {
        return request(app)
            .get('/')
            .then((response) => {
                expect(response.body.version).toEqual(CURRENT_VERSION);
                done();
            });
    });

    test('should send welcome message', (done) => {
        return request(app)
            .get('/')
            .then((response) => {
                expect(response.body.message).toEqual('Welcome in Authorisation Service.');
                done();
            });
    });
});

describe('Language', () => {
    test('should be english by default', () => {
        expect(locale.getLocale()).toBe('en');
    });
});
