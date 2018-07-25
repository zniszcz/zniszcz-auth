const request = require('supertest');
const app = require('../app');

describe('Register route', () => {
    test('should handle request with no data send', (done) => {
        return request(app)
            .post('/register')
            .expect(400)
            .then((response) => {
                const mock = {
                    errors: [
                        {
                            message: 'There\'s no username passed.',
                        },
                        {
                            message: 'There\'s no mail passed.',
                        },
                        {
                            message: 'There\'s no password passed.',
                        },
                    ],
                };
                expect(response.body).toEqual(mock);
                done();
            });
    });
});
