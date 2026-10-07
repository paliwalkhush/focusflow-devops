const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Task = require('../models/Task');

// GET full analytics summary
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Sessions in last 7 days
        const sessions = await Session.find({ completedAt: { $gte: sevenDaysAgo } });

        // Daily sessions grouped
        const dailyMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            dailyMap[label] = 0;
        }
        sessions.forEach(s => {
            if (s.type === 'pomodoro') {
                const label = new Date(s.completedAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                if (dailyMap.hasOwnProperty(label)) dailyMap[label]++;
            }
        });

        // Task stats
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ completed: true });
        const totalPomodoros = await Session.countDocuments({ type: 'pomodoro' });
        const totalFocusTime = await Session.aggregate([
            { $match: { type: 'pomodoro' } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]);

        // Category breakdown
        const tasks = await Task.find();
        const catMap = {};
        tasks.forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + 1;
        });

        // Priority breakdown
        const priMap = { high: 0, medium: 0, low: 0 };
        tasks.forEach(t => { priMap[t.priority]++; });

        res.json({
            daily: Object.entries(dailyMap).map(([label, count]) => ({ label, count })),
            totalTasks,
            completedTasks,
            totalPomodoros,
            totalFocusMinutes: totalFocusTime.length ? Math.round(totalFocusTime[0].total / 60) : 0,
            categories: Object.entries(catMap).map(([name, count]) => ({ name, count })),
            priorities: priMap
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
