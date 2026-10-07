const mongoose = require('mongoose');
const request = require('supertest');
const test = require('node:test');
const assert = require('node:assert');

// Mock MongoDB connection for unit testing.
// The real MongoDB connection is used when the application runs normally.
mongoose.connect = async () => {};

const app = require('../server');

test('GET /api/health should return backend health status', async () => {
    const response = await request(app)
        .get('/api/health');

    assert.ok(
        response.statusCode === 200 || response.statusCode === 503
    );

    assert.strictEqual(
        response.body.service,
        'focusflow-backend'
    );

    assert.ok(
        response.body.status === 'healthy' ||
        response.body.status === 'unhealthy'
    );

    assert.ok(
        response.body.database === 'connected' ||
        response.body.database === 'disconnected'
    );
});