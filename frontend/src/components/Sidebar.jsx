import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, ScanSearch, History, FileWarning, Settings,
  Sun, Moon, ChevronLeft, ChevronRight, Zap, ShieldCheck, LayoutDashboard, LogOut
} from 'lucide-react';
import { getToken, logoutUser } from '../services/api';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Admin Portal', id: 'nav-dashboard' },
  { path: '/scanner', icon: ScanSearch, label: 'Threat Scanner', id: 'nav-scanner' },
  { path: '/verify-company', icon: ShieldCheck, label: 'Verify Company', id: 'nav-verify' },
  { path: '/history', icon: History, label: 'Scan History', id: 'nav-history' },
  { path: '/about', icon: Shield, label: 'About', id: 'nav-about' },
];

export default function Sidebar({ theme, toggleTheme, collapsed, setCollapsed }) {
  const userRole = localStorage.getItem('userRole');
  const token = getToken();

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/';
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={28} />
            <div className="logo-pulse" />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">CyberTrust</span>
              <span className="logo-badge">AI SHIELD</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              id={item.id}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && <div className="nav-indicator" />}
            </NavLink>
          ))}
          {token && (
            <button
              className="nav-item"
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: '#ef4444' }}
            >
              <LogOut size={20} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          )}
        </nav>

        {/* Status Panel */}
        {!collapsed && (
          <div className="sidebar-status glass-card">
            <div className="status-header">
              <Zap size={14} className="status-icon" />
              <span>System Status</span>
            </div>
            <div className="status-item">
              <span className="status-dot online" />
              <span>AI Engine</span>
            </div>
            <div className="status-item">
              <span className="status-dot online" />
              <span>Threat DB</span>
            </div>
            <div className="status-item">
              <span className="status-dot online" />
              <span>OCR Module</span>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="sidebar-bottom">
          <button
            className="sidebar-action"
            onClick={toggleTheme}
            id="theme-toggle"
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            className="sidebar-action collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            id="sidebar-collapse"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <button
        className="mobile-menu-btn btn-icon"
        onClick={() => setCollapsed(!collapsed)}
        id="mobile-menu"
      >
        <ScanSearch size={20} />
      </button>
    </>
  );
}
