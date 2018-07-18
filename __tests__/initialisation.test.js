const request = require('supertest');
const app = require('../app');

describe('HealthCheck', () => {
    test('should response GET method', (done) => {
        return request(app).get('/').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});
