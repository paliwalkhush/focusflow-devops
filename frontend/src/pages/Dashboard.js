import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Zap, Target, TrendingUp, Circle, BarChart2 } from 'lucide-react';
import './Dashboard.css';

const API = '/api';

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: color }}>
                <Icon size={22} color="white" />
            </div>
            <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
                {sub && <span className="stat-sub">{sub}</span>}
            </div>
        </div>
    );
}

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/analytics`),
            axios.get(`${API}/tasks`)
        ]).then(([analyticsRes, tasksRes]) => {
            setStats(analyticsRes.data);
            setTasks(tasksRes.data.slice(0, 5));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (loading) return <div className="page-loading"><div className="spinner" /></div>;

    const todaySessions = stats?.daily?.[stats.daily.length - 1]?.count || 0;
    const completionRate = stats?.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    return (
        <div className="page dashboard">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-subtitle">{today}</p>
                </div>
                <div className="greeting-badge">
                    <Zap size={16} /> Keep the momentum!
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    icon={Zap}
                    label="Today's Pomodoros"
                    value={todaySessions}
                    color="linear-gradient(135deg, #8b5cf6, #a855f7)"
                    sub={`${todaySessions * 25} min focused`}
                />
                <StatCard
                    icon={Clock}
                    label="Total Focus Time"
                    value={`${stats?.totalFocusMinutes || 0}m`}
                    color="linear-gradient(135deg, #0ea5e9, #38bdf8)"
                    sub="All time"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Tasks Completed"
                    value={`${stats?.completedTasks || 0}/${stats?.totalTasks || 0}`}
                    color="linear-gradient(135deg, #10b981, #34d399)"
                    sub={`${completionRate}% completion rate`}
                />
                <StatCard
                    icon={Target}
                    label="Total Pomodoros"
                    value={stats?.totalPomodoros || 0}
                    color="linear-gradient(135deg, #f59e0b, #fbbf24)"
                    sub="All time"
                />
            </div>

            <div className="dashboard-bottom">
                <div className="glass-panel recent-tasks-card">
                    <div className="card-header">
                        <TrendingUp size={18} />
                        <h2>Recent Tasks</h2>
                    </div>
                    {tasks.length === 0 ? (
                        <p className="empty-msg">No tasks yet. Head to Tasks page to add some!</p>
                    ) : (
                        <ul className="recent-task-list">
                            {tasks.map(task => (
                                <li key={task._id} className={`recent-task-item ${task.completed ? 'done' : ''}`}>
                                    <div className="rtask-left">
                                        {task.completed
                                            ? <CheckCircle size={18} color="#10b981" />
                                            : <Circle size={18} color="#64748b" />}
                                        <span>{task.text}</span>
                                    </div>
                                    <div className="rtask-right">
                                        <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                                        <span className="session-count"><Clock size={14} /> {task.sessions}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="glass-panel weekly-summary-card">
                    <div className="card-header">
                        <BarChart2 size={18} />
                        <h2>This Week</h2>
                    </div>
                    {stats?.daily?.map((day, i) => (
                        <div key={i} className="week-bar-row">
                            <span className="week-day">{day.label.split(',')[0]}</span>
                            <div className="week-bar-bg">
                                <div
                                    className="week-bar-fill"
                                    style={{ width: `${Math.min(day.count * 15, 100)}%` }}
                                />
                            </div>
                            <span className="week-count">{day.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
