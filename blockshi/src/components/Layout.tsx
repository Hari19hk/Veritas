import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  Play,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Dashboard.css';

interface LayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

const Layout = ({ children, breadcrumb = 'dashboard' }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="dashboard-container">
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="logo-ai-text">AI</span>
            </div>
            <h1 className="logo-text">AI CONSOLE</h1>
          </div>
          <div className="breadcrumb">
            <span>console</span>
            <span className="breadcrumb-separator">/</span>
            {breadcrumb.includes(' / ') ? (
              breadcrumb.split(' / ').map((part, index, array) => (
                <span key={index}>
                  {index > 0 && <span className="breadcrumb-separator">/</span>}
                  <span className={index === 0 ? 'breadcrumb-highlight' : ''}>{part}</span>
                </span>
              ))
            ) : (
              <span>{breadcrumb}</span>
            )}
          </div>
        </div>
        <div className="header-center">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search trace ID or commit hash..."
              className="search-input"
            />
          </div>
        </div>
        <div className="header-right">
          <nav className="header-nav">
            <Link to="/" className={`header-nav-link ${isActive('/') ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/execute-task" className={`header-nav-link ${isActive('/execute-task') ? 'active' : ''}`}>
              Tasks
            </Link>
            <Link to="/logs" className={`header-nav-link ${isActive('/logs') ? 'active' : ''}`}>
              Logs
            </Link>
            <Link to="/settings" className={`header-nav-link ${isActive('/settings') ? 'active' : ''}`}>
              Settings
            </Link>
          </nav>
          <div className="header-icons">
            <Bell size={20} className="header-icon" />
            <Settings size={20} className="header-icon" />
          </div>
          <div className="user-info">
            <div className="user-details">
              <span className="user-label">Executor</span>
              <span className="user-role">admin::root</span>
            </div>
            <User size={18} className="user-icon" />
          </div>
          <div className="sync-info">
            <span className="sync-text">Last synced: 240ms ago</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content-wrapper">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <nav className="sidebar-nav">
            <Link
              to="/"
              className={`nav-item ${isActive('/') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <div className="dashboard-icon-wrapper">
                <LayoutDashboard size={20} />
              </div>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
            <Link
              to="/create-commitment"
              className={`nav-item ${isActive('/create-commitment') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <Plus size={20} />
              {!sidebarCollapsed && <span>Create Commitment</span>}
            </Link>
            <Link
              to="/execute-task"
              className={`nav-item ${isActive('/execute-task') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <Play size={20} />
              {!sidebarCollapsed && <span>Execute Task</span>}
            </Link>
            <Link
              to="/verify-proof"
              className={`nav-item ${isActive('/verify-proof') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <ShieldCheck size={20} />
              {!sidebarCollapsed && <span>Verify Proof</span>}
            </Link>
          </nav>

          <div className="sidebar-status">
            <div className={`status-item ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <CheckCircle2 size={18} className="status-icon verified" />
              {!sidebarCollapsed && <span>Audit Trail Verified</span>}
            </div>
            <div className={`status-item ${sidebarCollapsed ? 'collapsed' : ''}`}>
              <Lock size={18} className="status-icon encrypted" />
              {!sidebarCollapsed && <span>Encrypted Session</span>}
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="sidebar-version">
              <span>V2.4.0-STABLE</span>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

