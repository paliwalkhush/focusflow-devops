const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    userId: { type: String, default: 'default' },
    pomodoroTime: { type: Number, default: 25 },
    shortBreakTime: { type: Number, default: 5 },
    longBreakTime: { type: Number, default: 15 },
    longBreakInterval: { type: Number, default: 4 },
    autoStartBreaks: { type: Boolean, default: false },
    autoStartPomodoros: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('Settings', SettingsSchema);
