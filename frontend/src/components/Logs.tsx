import { useState, useEffect } from 'react';
import { FileCode, Clock, Hash, AlignLeft, Calendar } from 'lucide-react';
import './Dashboard.css'; // Reusing dashboard styles for consistency

interface Commitment {
  commitmentId: string;
  proofHash?: string; // Optional since backend doesn't return it
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

const Logs = () => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);

  useEffect(() => {
    const storedCommitments = localStorage.getItem('commitments');
    if (storedCommitments) {
      try {
        setCommitments(JSON.parse(storedCommitments));
      } catch (e) {
        console.error('Failed to parse commitments', e);
      }
    }
  }, []);

  return (
    <div className="dashboard-content">
      <div className="content-header">
        <div>
          <h2 className="page-title">Execution Logs</h2>
          <p className="page-subtitle">Immutable record of all committed autonomous tasks.</p>
        </div>
      </div>

      <div className="commitments-section">
        <div className="section-header">
          <h3 className="section-title">Commitment History</h3>
        </div>

        <div className="table-container">
          {commitments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <FileCode size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No commitments found. Create a new task to see logs here.</p>
            </div>
          ) : (
            <table className="commitments-table">
              <thead>
                <tr>
                  <th>COMMITMENT ID</th>
                  <th>TASK IDENTIFIER</th>
                  <th>TIMESTAMP</th>
                  <th>PROOF HASH</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {commitments.map((item) => (
                  <tr key={item.commitmentId}>
                    <td>
                      <span className="task-id" style={{ color: '#10b981' }}>{item.commitmentId}</span>
                    </td>
                    <td>
                      <div className="task-name">
                        <div className="task-name-text">{item.taskIdentifier}</div>
                        <div className="task-path" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlignLeft size={12} />
                          {item.missionBrief.substring(0, 30)}...
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-badge" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e5e7eb' }}>
                          <Calendar size={12} />
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '11px' }}>
                          <Clock size={12} />
                          <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.proofHash ? (
                        <div className="task-path" style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                          <Hash size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          {item.proofHash.substring(0, 16)}...
                        </div>
                      ) : (
                        <div className="task-path" style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                          <Hash size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                          N/A
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        <div>{item.startTime} - {item.endTime}</div>
                        <div style={{ marginTop: '4px' }}>
                          GRID: {item.location.lat.toFixed(2)}, {item.location.lng.toFixed(2)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;

