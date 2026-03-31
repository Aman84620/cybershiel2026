import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, ScanSearch, History, FileWarning, Settings,
  Sun, Moon, ChevronLeft, ChevronRight, Zap, ShieldCheck, LayoutDashboard, LogOut
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard', id: 'nav-dashboard', adminOnly: true },
  { path: '/scanner', icon: ScanSearch, label: 'Threat Scanner', id: 'nav-scanner', clientOnly: true },
  { path: '/verify-company', icon: ShieldCheck, label: 'Verify Company', id: 'nav-verify', clientOnly: true },
  { path: '/history', icon: History, label: 'Scan History', id: 'nav-history', clientOnly: true },
  { path: '/about', icon: Shield, label: 'About', id: 'nav-about', clientOnly: true },
  { path: '/', icon: LogOut, label: 'Logout', id: 'nav-logout' },
];

export default function Sidebar({ theme, toggleTheme, collapsed, setCollapsed }) {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const visibleNavItems = navItems.filter(item => {
    if (isAdmin) return item.adminOnly || item.path === '/';
    return item.clientOnly || item.path === '/';
  });

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
          {visibleNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              id={item.id}
              onClick={() => item.path === '/' && localStorage.removeItem('userRole')}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && <div className="nav-indicator" />}
            </NavLink>
          ))}
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
