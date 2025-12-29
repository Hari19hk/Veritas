import { useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Clock,
  Terminal,
  Activity,
  Globe,
  Zap,
  Wallet
} from 'lucide-react';
import Layout from './Layout';
import './VerifyExecutionProof.css';

const VerifyExecutionProof = () => {
  const [proofHash, setProofHash] = useState('...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 1500);
  };

  return (
    <Layout breadcrumb="verify proof">
      <div className="verify-proof-page">
        {/* Connect Wallet Button */}
        <div className="page-header-actions">
          <button className="connect-wallet-btn">
            <Wallet size={16} />
            Connect Wallet
          </button>
        </div>

        {/* Trustless Banner */}
        <div className="trustless-banner">
          <span className="banner-text">TRUSTLESS VERIFICATION SYSTEM</span>
        </div>

        {/* Page Header */}
        <div className="verify-header">
          <div>
            <h1 className="verify-title">VERIFY EXECUTION PROOF</h1>
            <p className="verify-description">
              Validate cryptographic commitments against the immutable ledger. Confirm location and
              timestamp integrity without authentication.
            </p>
          </div>
        </div>

        {/* Proof Hash Input Section */}
        <div className="proof-hash-section">
          <label className="section-label">ENTER PROOF HASH</label>
          <div className="hash-input-wrapper">
            <input
              type="text"
              className="hash-input"
              value={proofHash}
              onChange={(e) => setProofHash(e.target.value)}
              placeholder="0x..."
            />
            <button
              className="verify-btn"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              <CheckCircle2 size={18} />
              {isVerifying ? 'VERIFYING...' : 'VERIFY'}
            </button>
          </div>
          <div className="last-verified">
            Last verified block: <span className="block-number">#18,245,902</span>
          </div>
        </div>

        {/* Verification Status and Integrity Checks */}
        {isVerified && (
          <div className="verification-results">
            {/* Left Panel - Verification Status */}
            <div className="status-panel">
              <div className="status-content">
                <CheckCircle2 size={64} className="status-icon-large" />
                <h2 className="status-title">VALID PROOF</h2>
                <p className="status-subtitle">Hash match confirmed on-chain.</p>
              </div>
            </div>

            {/* Right Panel - Integrity Checks */}
            <div className="integrity-panel">
              <h3 className="integrity-title">Integrity Checks</h3>
              <div className="integrity-items">
                <div className="integrity-item">
                  <div className="integrity-icon-wrapper">
                    <MapPin size={20} className="integrity-icon" />
                    <CheckCircle2 size={16} className="integrity-check" />
                  </div>
                  <div className="integrity-content">
                    <span className="integrity-label">Location Data</span>
                    <span className="integrity-status">MATCH</span>
                  </div>
                </div>
                <div className="integrity-item">
                  <div className="integrity-icon-wrapper">
                    <Clock size={20} className="integrity-icon" />
                    <CheckCircle2 size={16} className="integrity-check" />
                  </div>
                  <div className="integrity-content">
                    <span className="integrity-label">Timestamp</span>
                    <span className="integrity-status">SYNCED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Console Log Area */}
        {isVerified && (
          <div className="console-section">
            <div className="console-header">
              <Terminal size={18} className="console-icon" />
              <span className="console-title">Console Output</span>
            </div>
            <div className="console-content">
              <div className="console-line">
                <span className="console-prompt">root@console:~$</span>
                <span className="console-command"> initiating handshake...</span>
              </div>
              <div className="console-line">
                <span className="console-info">INFO</span>
                <span className="console-time">[14:02:21]</span>
                <span className="console-message"> connecting to node 0x4a...</span>
              </div>
              <div className="console-line">
                <span className="console-info">INFO</span>
                <span className="console-time">[14:02:22]</span>
                <span className="console-message"> retrieving commitment block...</span>
              </div>
              <div className="console-line success">
                <span className="console-success">SUCCESS</span>
                <span className="console-time">[14:02:22]</span>
                <span className="console-message"> hash 0x8f2a... verified against ledger.</span>
              </div>
              <div className="console-line">
                <span className="console-info">INFO</span>
                <span className="console-time">[14:02:23]</span>
                <span className="console-message"> integrity check: location [OK]</span>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="metrics-section">
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-dot"></div>
              <span className="metric-label">NETWORK STATUS</span>
            </div>
            <div className="metric-value">99.9%</div>
            <div className="metric-subtitle">UPTIME</div>
          </div>
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-dot"></div>
              <span className="metric-label">GLOBAL PROOFS</span>
            </div>
            <div className="metric-value">842,129</div>
            <div className="metric-subtitle">VERIFIED TO DATE</div>
          </div>
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-dot"></div>
              <span className="metric-label">AVG. LATENCY</span>
            </div>
            <div className="metric-value">42ms</div>
            <div className="metric-subtitle">RESPONSE TIME</div>
          </div>
        </div>

        {/* Footer */}
        <div className="verify-footer">
          <div className="footer-left">
            <span className="footer-copyright">© 2024 AI Engineering Console. All rights reserved.</span>
          </div>
          <div className="footer-right">
            <a href="#" className="footer-link">Privacy Policy</a>
            <span className="footer-separator">|</span>
            <a href="#" className="footer-link">Terms of Service</a>
            <div className="footer-status">
              <div className="footer-status-dot"></div>
              <span className="footer-status-text">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyExecutionProof;
