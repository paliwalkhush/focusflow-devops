const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST create task
router.post('/', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT update task
router.put('/:id', async (req, res) => {
    try {
        const data = req.body;
        if (data.completed === true) data.completedAt = new Date();
        const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// POST increment session count
router.post('/:id/session', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $inc: { sessions: 1 } },
            { new: true }
        );
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update session' });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;
