import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Timer, CheckSquare, BarChart2, Settings, Zap } from 'lucide-react';
import './Navbar.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/timer', label: 'Timer', icon: Timer },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/settings', label: 'Settings', icon: Settings },
];

function Navbar() {
    return (
        <aside className="navbar">
            <div className="nav-logo">
                <Zap size={28} className="logo-icon" />
                <span>FocusFlow</span>
            </div>
            <nav className="nav-links">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="nav-footer">
                <p>v2.0.0</p>
            </div>
        </aside>
    );
}

export default Navbar;
