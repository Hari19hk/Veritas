import {
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Hourglass,
  Eye,
  Play
} from 'lucide-react';
import Layout from './Layout';
import './Dashboard.css';

interface Task {
  id: string;
  name: string;
  filePath: string;
  status: 'PROVEN' | 'IN PROGRESS' | 'COMMITTED';
  action: 'View Proof' | 'EXECUTE';
}

const Dashboard = () => {

  const tasks: Task[] = [
    {
      id: '#8f3a2d1',
      name: 'Risk Calc Update v4.2',
      filePath: 'src/utils/risk_calc.py',
      status: 'PROVEN',
      action: 'View Proof'
    },
    {
      id: '#b2c9e40',
      name: 'Supply Chain Volatility Model',
      filePath: 'src/models/context.py',
      status: 'IN PROGRESS',
      action: 'EXECUTE'
    },
    {
      id: '#a1d4f99',
      name: 'Global Weights Config',
      filePath: 'config/weights.json',
      status: 'COMMITTED',
      action: 'EXECUTE'
    },
    {
      id: '#c3f1a02',
      name: 'Token Normalization Fix',
      filePath: 'src/utils/tokenizer.py',
      status: 'PROVEN',
      action: 'View Proof'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROVEN':
        return '#10b981'; // green
      case 'IN PROGRESS':
        return '#f59e0b'; // orange
      case 'COMMITTED':
        return '#3b82f6'; // blue
      default:
        return '#6b7280';
    }
  };

  return (
    <Layout breadcrumb="dashboard">
          <div className="content-header">
            <div>
              <h2 className="page-title">Dashboard Overview</h2>
              <p className="page-subtitle">Manage AI logic commitments and verification proofs.</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card active-commitments">
              <div className="card-content">
                <div className="card-number">24</div>
                <div className="card-label">ACTIVE COMMITMENTS</div>
                <div className="card-trend">
                  <TrendingUp size={16} className="trend-icon" />
                  <span className="trend-text">+12% from last week</span>
                </div>
              </div>
              <div className="card-icon">
                <div className="icon-circle green">
                  <div className="icon-dots"></div>
                </div>
              </div>
            </div>

            <div className="summary-card pending-verification">
              <div className="card-content">
                <div className="card-number">7</div>
                <div className="card-label">PENDING VERIFICATION</div>
                <div className="card-warning">Requires attention - High priority queue.</div>
              </div>
              <div className="card-icon">
                <Hourglass size={24} className="hourglass-icon" />
              </div>
            </div>
          </div>

          {/* Active Commitments List */}
          <div className="commitments-section">
            <div className="section-header">
              <h3 className="section-title">Active Commitments List</h3>
              <div className="section-actions">
                <Filter size={18} className="action-icon" />
                <RefreshCw size={18} className="action-icon" />
              </div>
            </div>

            <div className="table-container">
              <table className="commitments-table">
                <thead>
                  <tr>
                    <th>TASK ID</th>
                    <th>TASK NAME</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <span className="task-id">{task.id}</span>
                      </td>
                      <td>
                        <div className="task-name">
                          <div className="task-name-text">{task.name}</div>
                          <div className="task-path">{task.filePath}</div>
                        </div>
                      </td>
                      <td>
                        <div className="status-badge">
                          <div
                            className="status-dot"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          ></div>
                          <span>{task.status}</span>
                        </div>
                      </td>
                      <td>
                        {task.action === 'View Proof' ? (
                          <button className="view-link">
                            <Eye size={16} />
                            View Proof
                          </button>
                        ) : (
                          <button className="execute-btn">
                            <Play size={14} />
                            EXECUTE
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-pagination">
                <span className="pagination-info">Showing 4 of 24 tasks</span>
                <div className="pagination-controls">
                  <button className="pagination-btn">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="pagination-btn active">1</button>
                  <button className="pagination-btn">2</button>
                  <button className="pagination-btn">3</button>
                  <button className="pagination-btn">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="logs-section">
            <div className="section-header">
              <h3 className="section-title">System Logs</h3>
              <div className="log-command">
                <code>tail -f /var/log/ai-engine.log</code>
              </div>
            </div>
            <div className="logs-container">
              <div className="log-entry">
                <span className="log-time">[14:02:44]</span>
                <span className="log-message">Worker thread spawned for task #b2c9e40</span>
              </div>
              <div className="log-entry">
                <span className="log-time">[14:02:45]</span>
                <span className="log-message">Context loaded from redis_cache (12ms)</span>
              </div>
              <div className="log-entry warning">
                <span className="log-time">[14:02:45]</span>
                <span className="log-message">Warning: Supply chain data is slightly stale</span>
              </div>
              <div className="log-entry">
                <span className="log-time">[14:02:46]</span>
                <span className="log-message">Execution pending user confirmation...</span>
              </div>
            </div>
          </div>
    </Layout>
  );
};

export default Dashboard;

