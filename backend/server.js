const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Prometheus default Node.js metrics
client.collectDefaultMetrics();

// HTTP request counter
const httpRequestCounter = new client.Counter({
    name: 'focusflow_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
    name: 'focusflow_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

// HTTP metrics middleware
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const duration = diff[0] + diff[1] / 1e9;

        const route = req.route?.path || req.path;

        httpRequestCounter.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route: route,
                status_code: res.statusCode
            },
            duration
        );
    });

    next();
});

const PORT = process.env.PORT || 5000;

const MONGO_URI =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusflow';

// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;

    res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? 'healthy' : 'unhealthy',
        service: 'focusflow-backend',
        database: dbState === 1 ? 'connected' : 'disconnected'
    });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Error:', err));

// Routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/analytics', require('./routes/analytics'));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;