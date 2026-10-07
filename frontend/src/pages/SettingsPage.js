import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RotateCcw, Clock, Coffee, Moon, Bell, BellOff, Info } from 'lucide-react';
import './SettingsPage.css';

const API = '/api/settings';

function SettingsPage() {
    const [settings, setSettings] = useState({
        pomodoroTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(API).then(r => {
            setSettings(r.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            await axios.put(API, settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            alert('Failed to save settings');
        }
    };

    const resetDefaults = () => {
        setSettings({
            pomodoroTime: 25,
            shortBreakTime: 5,
            longBreakTime: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true
        });
        setSaved(false);
    };

    if (loading) return <div className="page-loading"><div className="spinner" /></div>;

    return (
        <div className="page settings-page">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p className="page-subtitle">Customize your focus experience</p>
                </div>
                <div className="settings-actions">
                    <button className="reset-btn" onClick={resetDefaults}>
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
                        <Save size={16} /> {saved ? 'Saved!' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="settings-grid">
                <div className="settings-card">
                    <div className="settings-card-header">
                        <Clock size={20} color="#a855f7" />
                        <h3>Timer Durations</h3>
                    </div>
                    <div className="setting-item">
                        <div className="setting-label">
                            <span>Pomodoro</span>
                            <small>Focus session length</small>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range" min="5" max="60" step="5"
                                value={settings.pomodoroTime}
                                onChange={e => handleChange('pomodoroTime', Number(e.target.value))}
                            />
                            <span className="setting-value">{settings.pomodoroTime}m</span>
                        </div>
                    </div>
                    <div className="setting-item">
                        <div className="setting-label">
                            <Coffee size={16} color="#10b981" />
                            <span>Short Break</span>
                            <small>Quick rest period</small>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range" min="1" max="15" step="1"
                                value={settings.shortBreakTime}
                                onChange={e => handleChange('shortBreakTime', Number(e.target.value))}
                            />
                            <span className="setting-value">{settings.shortBreakTime}m</span>
                        </div>
                    </div>
                    <div className="setting-item">
                        <div className="setting-label">
                            <Moon size={16} color="#0ea5e9" />
                            <span>Long Break</span>
                            <small>Extended rest period</small>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range" min="10" max="30" step="5"
                                value={settings.longBreakTime}
                                onChange={e => handleChange('longBreakTime', Number(e.target.value))}
                            />
                            <span className="setting-value">{settings.longBreakTime}m</span>
                        </div>
                    </div>
                    <div className="setting-item">
                        <div className="setting-label">
                            <span>Long Break Interval</span>
                            <small>Pomodoros before long break</small>
                        </div>
                        <div className="setting-control">
                            <input
                                type="range" min="2" max="8" step="1"
                                value={settings.longBreakInterval}
                                onChange={e => handleChange('longBreakInterval', Number(e.target.value))}
                            />
                            <span className="setting-value">{settings.longBreakInterval}</span>
                        </div>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="settings-card-header">
                        <Bell size={20} color="#ec4899" />
                        <h3>Preferences</h3>
                    </div>
                    <div className="setting-item toggle-item">
                        <div className="setting-label">
                            {settings.soundEnabled ? <Bell size={16} color="#a855f7" /> : <BellOff size={16} />}
                            <span>Sound Notifications</span>
                            <small>Play sound when timer ends</small>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.soundEnabled}
                                onChange={e => handleChange('soundEnabled', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <div className="setting-item toggle-item">
                        <div className="setting-label">
                            <span>Auto-start Breaks</span>
                            <small>Automatically start breaks</small>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.autoStartBreaks}
                                onChange={e => handleChange('autoStartBreaks', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <div className="setting-item toggle-item">
                        <div className="setting-label">
                            <span>Auto-start Pomodoros</span>
                            <small>Automatically start next focus</small>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.autoStartPomodoros}
                                onChange={e => handleChange('autoStartPomodoros', e.target.checked)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>

                <div className="settings-card about-card">
                    <div className="settings-card-header">
                        <Info size={20} color="#f59e0b" />
                        <h3>About FocusFlow</h3>
                    </div>
                    <p className="about-text">
                        FocusFlow is a Pomodoro Productivity Tracker that helps you manage tasks,
                        track focus sessions, and analyze your productivity patterns. Built with the
                        MERN stack (MongoDB, Express, React, Node.js).
                    </p>
                    <div className="tech-tags">
                        <span className="tech-tag">React</span>
                        <span className="tech-tag">Node.js</span>
                        <span className="tech-tag">Express</span>
                        <span className="tech-tag">MongoDB</span>
                        <span className="tech-tag">Chart.js</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
