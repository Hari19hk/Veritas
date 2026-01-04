import { useState, useEffect } from 'react';
import {
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Hourglass,
  Eye,
  Play,
  AlignLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Commitment {
  commitmentId: string;
  proofHash?: string;
  timestamp: string;
  taskIdentifier: string;
  missionBrief: string;
  startTime: string;
  endTime: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface Task {
  id: string;
  name: string;
  brief: string;
  status: 'PROVEN' | 'IN PROGRESS' | 'COMMITTED';
  action: 'View Proof' | 'EXECUTE';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState({ active: 0, pending: 0 });

  useEffect(() => {
    const storedCommitments = localStorage.getItem('commitments');
    if (storedCommitments) {
      try {
        const commitments: Commitment[] = JSON.parse(storedCommitments);

        // Map commitments to Task interface for the dashboard table
        const mappedTasks: Task[] = commitments.map(c => ({
          id: c.commitmentId.startsWith('#') ? c.commitmentId : `#${c.commitmentId}`,
          name: c.taskIdentifier,
          brief: c.missionBrief,
          status: c.proofHash ? 'PROVEN' : 'COMMITTED', // Simple logic: if proofHash exists, it's proven
          action: c.proofHash ? 'View Proof' : 'EXECUTE'
        }));

        setTasks(mappedTasks.slice(0, 5)); // Show only latest 5 on dashboard
        setCounts({
          active: commitments.length,
          pending: commitments.filter(c => !c.proofHash).length
        });
      } catch (e) {
        console.error('Failed to parse commitments', e);
      }
    }
  }, []);

  const handleViewProof = (id: string) => {
    // Navigate to a proof page - stripping the # if present
    const cleanId = id.startsWith('#') ? id.substring(1) : id;
    navigate(`/proof/${cleanId}`);
  };

  const handleExecute = (_id: string) => {
    // Navigate to execute task page
    navigate('/app/execute-task');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROVEN':
        return 'var(--tech-green)'; // green
      case 'IN PROGRESS':
        return '#f59e0b'; // orange
      case 'COMMITTED':
        return '#3b82f6'; // blue
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-background">
        <div className="straight-grid"></div>
        <div className="dashboard-glow"></div>
      </div>

      <div className="content-header">
        <div>
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Manage AI logic commitments and verification proofs.</p>
        </div>
        <div className="last-synced">
          <span className="sync-signal"></span>
          Last synced: 240ms ago
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card active-commitments">
          <div className="card-bg-effect"></div>
          <div className="card-content">
            <div className="card-number">{counts.active}</div>
            <div className="card-label">ACTIVE COMMITMENTS</div>
            <div className="card-trend">
              <TrendingUp size={14} className="trend-icon" />
              <span className="trend-text">+12% from last week</span>
            </div>
          </div>
          <div className="card-visual">
            <div className="cyber-oracle">
              <div className="oracle-ring"></div>
              <div className="oracle-core"></div>
            </div>
          </div>
        </div>

        <div className="summary-card pending-verification">
          <div className="card-bg-effect"></div>
          <div className="card-content">
            <div className="card-number">{counts.pending}</div>
            <div className="card-label">PENDING VERIFICATION</div>
            <div className="card-warning">
              <span className="warning-dot"></span>
              High priority queue
            </div>
          </div>
          <div className="card-visual">
            <Hourglass size={32} className="hourglass-icon pulse" />
          </div>
        </div>
      </div>

      {/* Active Commitments List */}
      <div className="commitments-section">
        <div className="section-header">
          <h3 className="section-title">Latest Commitments</h3>
          <div className="section-actions">
            <Filter size={18} className="action-icon" />
            <RefreshCw size={18} className="action-icon" onClick={() => window.location.reload()} />
          </div>
        </div>

        <div className="table-container">
          <table className="commitments-table">
            <thead>
              <tr>
                <th>TASK ID</th>
                <th>TASK IDENTIFIER</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No active commitments found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <span className="task-id">{task.id}</span>
                    </td>
                    <td>
                      <div className="task-name">
                        <span className="task-name-text">{task.name}</span>
                        <div className="task-path">
                          <AlignLeft size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          {task.brief.substring(0, 40)}...
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-badge">
                        <div
                          className="status-dot"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        ></div>
                        <span style={{ color: getStatusColor(task.status) }}>{task.status}</span>
                      </div>
                    </td>
                    <td>
                      {task.action === 'View Proof' ? (
                        <button className="view-link" onClick={() => handleViewProof(task.id)}>
                          <Eye size={14} />
                          View Proof
                        </button>
                      ) : (
                        <button className="execute-btn" onClick={() => handleExecute(task.id)}>
                          <Play size={10} fill="currentColor" />
                          EXECUTE
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
    </div>
  );
};

export default Dashboard;

