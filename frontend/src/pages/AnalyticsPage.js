import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler
} from 'chart.js';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';
import './AnalyticsPage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const API = '/api';

function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/analytics`),
            axios.get(`${API}/sessions`)
        ]).then(([aRes, sRes]) => {
            setData(aRes.data);
            setSessions(sRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-loading"><div className="spinner" /></div>;

    const barData = {
        labels: data?.daily?.map(d => d.label.split(',')[0]) || [],
        datasets: [{
            label: 'Pomodoros',
            data: data?.daily?.map(d => d.count) || [],
            backgroundColor: 'rgba(168, 85, 247, 0.6)',
            borderColor: '#a855f7',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const lineData = {
        labels: data?.daily?.map(d => d.label.split(',')[0]) || [],
        datasets: [{
            label: 'Focus Minutes',
            data: data?.daily?.map(d => d.count * 25) || [],
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ec4899',
            pointBorderColor: '#ec4899',
        }]
    };

    const catData = {
        labels: data?.categories?.map(c => c.name) || [],
        datasets: [{
            data: data?.categories?.map(c => c.count) || [],
            backgroundColor: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const priData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [data?.priorities?.high || 0, data?.priorities?.medium || 0, data?.priorities?.low || 0],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 10,
                padding: 12,
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: { color: '#64748b' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)' },
                ticks: { color: '#64748b' },
                beginAtZero: true
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', padding: 16, usePointStyle: true }
            }
        },
        cutout: '65%'
    };

    const recentPomodoros = sessions.filter(s => s.type === 'pomodoro').slice(0, 8);

    return (
        <div className="page analytics-page">
            <div className="page-header">
                <h1>Analytics</h1>
                <p className="page-subtitle">Track your productivity patterns</p>
            </div>

            <div className="analytics-stats">
                <div className="a-stat">
                    <TrendingUp size={20} color="#a855f7" />
                    <div>
                        <h4>{data?.totalPomodoros || 0}</h4>
                        <p>Total Pomodoros</p>
                    </div>
                </div>
                <div className="a-stat">
                    <Clock size={20} color="#ec4899" />
                    <div>
                        <h4>{data?.totalFocusMinutes || 0}m</h4>
                        <p>Focus Time</p>
                    </div>
                </div>
                <div className="a-stat">
                    <Target size={20} color="#10b981" />
                    <div>
                        <h4>{data?.completedTasks || 0}</h4>
                        <p>Tasks Done</p>
                    </div>
                </div>
                <div className="a-stat">
                    <Award size={20} color="#f59e0b" />
                    <div>
                        <h4>{data?.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0}%</h4>
                        <p>Completion</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Daily Pomodoros (Last 7 Days)</h3>
                    <div className="chart-container">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Focus Time Trend</h3>
                    <div className="chart-container">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>
                <div className="chart-card small">
                    <h3>Tasks by Category</h3>
                    <div className="chart-container-sm">
                        <Doughnut data={catData} options={doughnutOptions} />
                    </div>
                </div>
                <div className="chart-card small">
                    <h3>Tasks by Priority</h3>
                    <div className="chart-container-sm">
                        <Doughnut data={priData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div className="recent-section">
                <h3>Recent Sessions</h3>
                {recentPomodoros.length === 0 ? (
                    <p className="empty-msg">No sessions recorded yet. Start a Pomodoro!</p>
                ) : (
                    <div className="session-history">
                        {recentPomodoros.map((s, i) => (
                            <div key={i} className="session-row">
                                <div className="session-type-badge">🍅</div>
                                <div className="session-detail">
                                    <span>{s.taskText}</span>
                                    <small>{Math.round(s.duration / 60)} min</small>
                                </div>
                                <span className="session-time">
                                    {new Date(s.completedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsPage;
