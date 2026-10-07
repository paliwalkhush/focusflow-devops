import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, Clock, Filter, Search, Edit3, X, Save } from 'lucide-react';
import './TasksPage.css';

const API = 'http://localhost:5000/api/tasks';
const CATEGORIES = ['General', 'Work', 'Study', 'Personal', 'Health', 'Other'];

function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');
    const [priority, setPriority] = useState('medium');
    const [category, setCategory] = useState('General');
    const [estimated, setEstimated] = useState(1);
    const [notes, setNotes] = useState('');

    const [filter, setFilter] = useState('all'); // all, active, completed
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(API);
            setTasks(res.data);
        } catch (e) { console.error(e); }
    };

    const addTask = async () => {
        if (!input.trim()) return;
        try {
            await axios.post(API, {
                text: input, priority, category,
                estimatedSessions: estimated, notes
            });
            setInput(''); setPriority('medium'); setCategory('General');
            setEstimated(1); setNotes(''); setShowForm(false);
            fetchTasks();
        } catch (e) { console.error(e); }
    };

    const toggleComplete = async (task) => {
        try {
            await axios.put(`${API}/${task._id}`, { completed: !task.completed });
            fetchTasks();
        } catch (e) { console.error(e); }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API}/${id}`);
            fetchTasks();
        } catch (e) { console.error(e); }
    };

    const startEdit = (task) => {
        setEditId(task._id);
        setEditText(task.text);
    };

    const saveEdit = async () => {
        if (!editText.trim()) return;
        try {
            await axios.put(`${API}/${editId}`, { text: editText });
            setEditId(null); setEditText('');
            fetchTasks();
        } catch (e) { console.error(e); }
    };

    const filtered = tasks.filter(t => {
        if (filter === 'active' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        if (catFilter !== 'All' && t.category !== catFilter) return false;
        if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const activeCount = tasks.filter(t => !t.completed).length;
    const doneCount = tasks.filter(t => t.completed).length;

    return (
        <div className="page tasks-page">
            <div className="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p className="page-subtitle">{activeCount} active &middot; {doneCount} completed</p>
                </div>
                <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    <span>{showForm ? 'Cancel' : 'New Task'}</span>
                </button>
            </div>

            {showForm && (
                <div className="new-task-form glass-panel">
                    <div className="form-row">
                        <input
                            className="form-input-main"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="What do you need to do?"
                            onKeyDown={e => e.key === 'Enter' && addTask()}
                        />
                    </div>
                    <div className="form-row form-options">
                        <div className="form-group">
                            <label>Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Est. Pomodoros</label>
                            <input type="number" min="1" max="20" value={estimated}
                                onChange={e => setEstimated(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="form-row">
                        <textarea
                            className="form-notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Notes (optional)"
                            rows={2}
                        />
                    </div>
                    <button className="form-submit" onClick={addTask}>Add Task</button>
                </div>
            )}

            <div className="task-filters">
                <div className="search-box">
                    <Search size={16} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." />
                </div>
                <div className="filter-tabs">
                    {['all', 'active', 'completed'].map(f => (
                        <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>{f}</button>
                    ))}
                </div>
                <div className="cat-filter">
                    <Filter size={14} />
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="task-list-full">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>No tasks found</p>
                    </div>
                ) : (
                    filtered.map(task => (
                        <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                            <div className="task-card-left">
                                <div className="task-check" onClick={() => toggleComplete(task)}>
                                    {task.completed && <Check size={14} color="white" />}
                                </div>
                                <div className="task-card-content">
                                    {editId === task._id ? (
                                        <div className="edit-row">
                                            <input value={editText} onChange={e => setEditText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && saveEdit()} className="edit-input" />
                                            <button className="icon-btn save" onClick={saveEdit}><Save size={16} /></button>
                                            <button className="icon-btn cancel" onClick={() => setEditId(null)}><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="task-text">{task.text}</span>
                                            {task.notes && <p className="task-notes">{task.notes}</p>}
                                        </>
                                    )}
                                    <div className="task-meta">
                                        <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                                        <span className="cat-tag">{task.category}</span>
                                        <span className="pomodoro-count">
                                            <Clock size={13} /> {task.sessions}/{task.estimatedSessions || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="task-card-actions">
                                {!task.completed && (
                                    <button className="icon-btn" onClick={() => startEdit(task)} title="Edit">
                                        <Edit3 size={16} />
                                    </button>
                                )}
                                <button className="icon-btn danger" onClick={() => deleteTask(task._id)} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default TasksPage;
