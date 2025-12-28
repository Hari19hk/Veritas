import { useState } from 'react';
import {
  Box,
  Link as LinkIcon,
  CheckCircle2,
  Copy,
  Lock,
  FileCode
} from 'lucide-react';
import Layout from './Layout';
import './ProofOfExecution.css';

const ProofOfExecution = () => {
  const [copied, setCopied] = useState(false);

  const proofHash = '0x8f7d9a2...3b2a9c';
  const commitmentId = 'CID-9942-ALPHA-V2';
  const timestamp = '2023-10-27 14:32:01 UTC';
  const executionId = '#2023-X99-EXEC';

  const handleCopyHash = () => {
    navigator.clipboard.writeText('0x8f7d9a2e4c1b3f5a6d7e8c9b2a1f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a3b2a9c');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout breadcrumb="proof of execution">
      <div className="proof-page">
        {/* System Status */}
        <div className="system-status-header">
          <div className="status-indicator"></div>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>

        {/* Status Badge and Execution ID */}
        <div className="centered-content">
          <div className="status-badge">
            <span className="badge-text">FINALIZED</span>
          </div>
          <div className="execution-id">{executionId}</div>
        </div>

        {/* Page Header */}
        <div className="proof-header">
          <h1 className="proof-title">PROOF OF EXECUTION</h1>
          <p className="proof-subtitle">
            Cryptographic verification of the AI model's decision path and logic commitment.
          </p>
        </div>

        {/* Proof Generation Status */}
        <div className="proof-status-section">
          <div className="status-card">
            <div className="status-icon-wrapper">
              <Box size={48} className="status-icon-large" />
              <CheckCircle2 size={20} className="status-check" />
            </div>
            <h3 className="status-title">Proof Generated</h3>
            <p className="status-subtitle">Artifact created successfully</p>
          </div>

          <div className="status-connector">
            <div className="connector-line"></div>
            <div className="connector-dot"></div>
          </div>

          <div className="status-card">
            <div className="status-icon-wrapper">
              <LinkIcon size={48} className="status-icon-large" />
              <CheckCircle2 size={20} className="status-check" />
            </div>
            <h3 className="status-title">Anchored on Blockchain</h3>
            <p className="status-subtitle">Block #19248851 Verified</p>
          </div>
        </div>

        {/* Proof Details */}
        <div className="proof-details-section">
          <div className="details-header">
            <FileCode size={18} className="details-icon" />
            <h2 className="details-title">Proof Details</h2>
          </div>
          <div className="proof-details-box">
            <div className="details-grid">
              <div className="detail-item">
                <label className="detail-label">PROOF HASH</label>
                <div className="detail-value hash-value">{proofHash}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">COMMITMENT ID</label>
                <div className="detail-value">{commitmentId}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">TIMESTAMP</label>
                <div className="detail-value">{timestamp}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">FORMAT</label>
                <div className="format-badge">ISO 8601</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="proof-actions">
          <button className="copy-btn" onClick={handleCopyHash}>
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy Proof Hash'}
          </button>
        </div>

        {/* Footer */}
        <div className="proof-footer">
          <Lock size={14} className="footer-icon" />
          <span className="footer-text">Immutable Record</span>
        </div>
      </div>
    </Layout>
  );
};

export default ProofOfExecution;

