const request = require('supertest');
const app = require('../app');

describe('HealthCheck', () => {
    test('should response GET method', () => {
        return request(app)
            .get('/')
            .expect(200);
    });
});

test('should have information about application version', (done) => {
    return request(app).get('/')
        .then((response) => {
            expect(typeof response.body.version).toBe('string');
            expect(response.body.length).not.toBe(0);
            done();
        });
});
