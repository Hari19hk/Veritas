import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  Play,
  CheckCircle2,
  Lock,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  LogOut
} from 'lucide-react';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import './Dashboard.css';

interface LayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

const Layout = ({ children, breadcrumb = 'dashboard' }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();

    if (!query) return;

    // Search mappings
    const searchMap: { [key: string]: string } = {
      'dashboard': '/app/dashboard',
      'create': '/app/create-commitment',
      'commitment': '/app/create-commitment',
      'execute': '/app/execute-task',
      'task': '/app/execute-task',
      'logs': '/app/logs',
    };

    // Check for matches
    for (const [keyword, path] of Object.entries(searchMap)) {
      if (query.includes(keyword)) {
        navigate(path);
        setSearchQuery('');
        return;
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <Shield size={20} color="#10b981" fill="#10b981" fillOpacity={0.2} />
            </div>
            <h1 className="logo-text">Veritas</h1>
          </div>
          <div className="breadcrumb">
            <span>console</span>
            <span className="breadcrumb-separator">/</span>
            {breadcrumb.includes(' / ') ? (
              breadcrumb.split(' / ').map((part, index) => (
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
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search trace ID or commit hash..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-details">
              <span className="user-label">Executor</span>
              <span className="user-role">admin::root</span>
            </div>
            <User size={18} className="user-icon" />
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className={`dashboard-content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
              to="/app/dashboard"
              className={`nav-item ${isActive('/app/dashboard') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <div className="dashboard-icon-wrapper">
                <LayoutDashboard size={20} />
              </div>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
            <Link
              to="/app/create-commitment"
              className={`nav-item ${isActive('/app/create-commitment') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <Plus size={20} />
              {!sidebarCollapsed && <span>Create Commitment</span>}
            </Link>
            <Link
              to="/app/execute-task"
              className={`nav-item ${isActive('/app/execute-task') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <Play size={20} />
              {!sidebarCollapsed && <span>Execute Task</span>}
            </Link>
            <Link
              to="/app/logs"
              className={`nav-item ${isActive('/app/logs') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <FileText size={20} />
              {!sidebarCollapsed && <span>Execution Logs</span>}
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

