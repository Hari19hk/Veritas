import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  Play,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Lock,
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return;

    // Search mappings
    const searchMap: { [key: string]: string } = {
      'dashboard': '/',
      'create': '/create-commitment',
      'commitment': '/create-commitment',
      'execute': '/execute-task',
      'task': '/execute-task',
      'proof': '/proof-of-execution',
      'execution': '/proof-of-execution',
      'verify': '/verify-execution-proof',
      'verification': '/verify-execution-proof',
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
          <div className="logo-section">
            <div className="logo-icon">
              <span className="logo-ai-text">AI</span>
            </div>
            <h1 className="logo-text">CONSOLE</h1>
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
              to="/proof-of-execution"
              className={`nav-item ${isActive('/proof-of-execution') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <FileCheck size={20} />
              {!sidebarCollapsed && <span>Proof of Execution</span>}
            </Link>
            <Link
              to="/verify-execution-proof"
              className={`nav-item ${isActive('/verify-execution-proof') ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            >
              <ShieldCheck size={20} />
              {!sidebarCollapsed && <span>Verify execution proof</span>}
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

