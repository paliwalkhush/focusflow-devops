const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// GET all sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ completedAt: -1 }).limit(100);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// POST log a new session
router.post('/', async (req, res) => {
    try {
        const session = new Session(req.body);
        await session.save();
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: 'Failed to log session' });
    }
});

// DELETE all sessions (reset)
router.delete('/reset', async (req, res) => {
    try {
        await Session.deleteMany({});
        res.json({ message: 'All sessions cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset sessions' });
    }
});

module.exports = router;
