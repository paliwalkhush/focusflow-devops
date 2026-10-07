const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne({ userId: 'default' });
        if (!settings) {
            settings = await new Settings({ userId: 'default' }).save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT update settings
router.put('/', async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { userId: 'default' },
            req.body,
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
