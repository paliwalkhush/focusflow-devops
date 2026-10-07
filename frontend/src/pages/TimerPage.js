import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, RotateCcw, SkipForward, Check, Clock, Volume2, VolumeX } from 'lucide-react';
import './TimerPage.css';

const API = '/api';

function TimerPage() {
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [settings, setSettings] = useState({
        pomodoroTime: 25, shortBreakTime: 5, longBreakTime: 15,
        longBreakInterval: 4, soundEnabled: true
    });

    const [mode, setMode] = useState('pomodoro');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);
    const [soundOn, setSoundOn] = useState(true);

    useEffect(() => {
        axios.get(`${API}/tasks`).then(r => {
            const incomplete = r.data.filter(t => !t.completed);
            setTasks(incomplete);
            if (incomplete.length > 0) setActiveTask(incomplete[0]._id);
        }).catch(() => {});
        axios.get(`${API}/settings`).then(r => {
            setSettings(r.data);
            setTimeLeft(r.data.pomodoroTime * 60);
            setSoundOn(r.data.soundEnabled);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            handleComplete();
        }
        return () => clearInterval(interval);
    // eslint-disable-next-line
    }, [isActive, timeLeft]);

    const getModeTime = (m) => {
        if (m === 'pomodoro') return settings.pomodoroTime * 60;
        if (m === 'shortBreak') return settings.shortBreakTime * 60;
        return settings.longBreakTime * 60;
    };

    const changeMode = (m) => {
        setIsActive(false);
        setMode(m);
        setTimeLeft(getModeTime(m));
    };

    const handleComplete = async () => {
        if (soundOn) playSound();

        if (mode === 'pomodoro') {
            const newCount = sessionCount + 1;
            setSessionCount(newCount);

            // Log session
            const activeTaskData = tasks.find(t => t._id === activeTask);
            await axios.post(`${API}/sessions`, {
                taskId: activeTask || null,
                taskText: activeTaskData?.text || 'Untracked',
                type: 'pomodoro',
                duration: settings.pomodoroTime * 60
            }).catch(() => {});

            // Increment task session
            if (activeTask) {
                await axios.post(`${API}/tasks/${activeTask}/session`).catch(() => {});
                const r = await axios.get(`${API}/tasks`).catch(() => {});
                if (r) setTasks(r.data.filter(t => !t.completed));
            }

            // Auto switch to break
            if (newCount % settings.longBreakInterval === 0) {
                changeMode('longBreak');
            } else {
                changeMode('shortBreak');
            }
            alert('🍅 Pomodoro complete! Time for a break.');
        } else {
            // Log break session
            await axios.post(`${API}/sessions`, {
                type: mode,
                duration: getModeTime(mode),
                taskText: 'Break'
            }).catch(() => {});
            changeMode('pomodoro');
            alert('☕ Break over! Ready to focus?');
        }
    };

    const playSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1000;
                gain2.gain.value = 0.3;
                osc2.start();
                osc2.stop(ctx.currentTime + 0.3);
            }, 350);
        } catch (e) {}
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const progress = 1 - (timeLeft / getModeTime(mode));
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;

    const modeColors = {
        pomodoro: '#a855f7',
        shortBreak: '#10b981',
        longBreak: '#0ea5e9'
    };

    return (
        <div className="page timer-page">
            <div className="page-header">
                <h1>Focus Timer</h1>
                <button
                    className="sound-toggle"
                    onClick={() => setSoundOn(!soundOn)}
                    title={soundOn ? 'Mute' : 'Unmute'}
                >
                    {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            </div>

            <div className="timer-layout">
                <div className="timer-main">
                    <div className="mode-selector">
                        <button className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`}
                            onClick={() => changeMode('pomodoro')}>Pomodoro</button>
                        <button className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
                            onClick={() => changeMode('shortBreak')}>Short Break</button>
                        <button className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
                            onClick={() => changeMode('longBreak')}>Long Break</button>
                    </div>

                    <div className="timer-circle-wrapper">
                        <svg className="timer-svg" viewBox="0 0 320 320">
                            <circle
                                cx="160" cy="160" r={radius}
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="160" cy="160" r={radius}
                                fill="none"
                                stroke={modeColors[mode]}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform="rotate(-90 160 160)"
                                className="progress-ring"
                            />
                        </svg>
                        <div className="timer-display">
                            <span className="timer-time">{formatTime(timeLeft)}</span>
                            <span className="timer-mode-label">{mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
                        </div>
                    </div>

                    <div className="timer-controls">
                        <button className="control-btn" onClick={() => changeMode(mode)}>
                            <RotateCcw size={22} />
                        </button>
                        <button className="control-btn primary" onClick={() => setIsActive(!isActive)}>
                            {isActive ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: 4 }} />}
                        </button>
                        <button className="control-btn" onClick={() => handleComplete()}>
                            <SkipForward size={22} />
                        </button>
                    </div>

                    <div className="session-dots">
                        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
                            <div key={i} className={`session-dot ${i < (sessionCount % settings.longBreakInterval) ? 'filled' : ''}`} />
                        ))}
                    </div>
                </div>

                <div className="timer-sidebar">
                    <h3><Clock size={18} /> Active Task</h3>
                    {tasks.length === 0 ? (
                        <p className="empty-msg">No pending tasks</p>
                    ) : (
                        <div className="timer-task-list">
                            {tasks.map(t => (
                                <div
                                    key={t._id}
                                    className={`timer-task-item ${activeTask === t._id ? 'selected' : ''}`}
                                    onClick={() => setActiveTask(t._id)}
                                >
                                    <div className="timer-task-radio">
                                        {activeTask === t._id && <Check size={14} />}
                                    </div>
                                    <div className="timer-task-info">
                                        <span>{t.text}</span>
                                        <small>{t.sessions}/{t.estimatedSessions || 1} pomodoros</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TimerPage;
