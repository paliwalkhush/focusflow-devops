import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, RotateCcw, Trash2, CheckCircle } from 'lucide-react';
import './App.css';

const API_URL = "http://localhost:5000/api/tasks";

function App() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState("");
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Fetch Tasks
    useEffect(() => {
        axios.get(API_URL).then(res => setTasks(res.data));
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            alert("Focus Session Complete!");
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Task Handlers
    const addTask = async () => {
        if (!input) return;
        const res = await axios.post(API_URL, { text: input });
        setTasks([...tasks, res.data]);
        setInput("");
    };

    const deleteTask = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
    };

    return (
        <div className="app-container">
            <header>
                <h1>FocusFlow</h1>
                <p>Pomodoro & Task Tracker</p>
            </header>

            <div className="timer-card">
                <h2 className="display">{formatTime(timeLeft)}</h2>
                <div className="timer-controls">
                    <button onClick={() => setIsActive(!isActive)}>
                        {isActive ? <Pause /> : <Play />}
                    </button>
                    <button onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}>
                        <RotateCcw />
                    </button>
                </div>
            </div>

            <div className="task-section">
                <div className="input-group">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What are you working on?"
                    />
                    <button onClick={addTask}>Add Task</button>
                </div>

                <div className="task-list">
                    {tasks.map(task => (
                        <div key={task._id} className="task-item">
                            <span>{task.text}</span>
                            <div className="actions">
                                <button onClick={() => deleteTask(task._id)}><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;