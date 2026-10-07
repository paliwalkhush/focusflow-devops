const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    taskText: { type: String, default: 'Untracked' },
    type: { type: String, enum: ['pomodoro', 'shortBreak', 'longBreak'], default: 'pomodoro' },
    duration: { type: Number, required: true }, // in seconds
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
