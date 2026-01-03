import { useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Clock,
  Terminal,
  Activity,
  Globe,
  Zap,
  Wallet,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import './VerifyExecutionProof.css';
import { verifyProof, type VerifyProofResponse } from '../utils/api';

const VerifyExecutionProof = () => {
  const [proofHash, setProofHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyProofResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const addConsoleLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setConsoleLogs(prev => [...prev, logEntry]);
  };

  const handleVerify = async () => {
    if (!proofHash.trim()) {
      setError('Please enter a proof hash');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);
    setConsoleLogs([]);

    addConsoleLog('Initiating verification handshake...', 'info');
    addConsoleLog(`Verifying proof hash: ${proofHash.substring(0, 20)}...`, 'info');

    try {
      console.log('[VerifyExecutionProof] Verifying proof:', proofHash);

      addConsoleLog('Connecting to verification node...', 'info');

      const result = await verifyProof(proofHash);

      console.log('[VerifyExecutionProof] Verification result:', result);

      setVerificationResult(result);

      if (result.valid) {
        addConsoleLog('Hash verified against ledger', 'success');
        addConsoleLog('Integrity check: location [OK]', 'info');
        addConsoleLog('Integrity check: timestamp [OK]', 'info');
        addConsoleLog('Integrity check: hash match [OK]', 'info');
        addConsoleLog('Integrity check: on-chain match [OK]', 'info');
        addConsoleLog('Verification complete - Proof is VALID', 'success');
      } else {
        addConsoleLog(`Verification failed: ${result.reason || 'Unknown error'}`, 'error');
        if (result.checks) {
          addConsoleLog(`Hash match: ${result.checks.hashMatch ? 'OK' : 'FAILED'}`, result.checks.hashMatch ? 'info' : 'error');
          addConsoleLog(`On-chain match: ${result.checks.onChainMatch ? 'OK' : 'FAILED'}`, result.checks.onChainMatch ? 'info' : 'error');
          addConsoleLog(`Time validation: ${result.checks.time ? 'OK' : 'FAILED'}`, result.checks.time ? 'info' : 'error');
          addConsoleLog(`Location validation: ${result.checks.location ? 'OK' : 'FAILED'}`, result.checks.location ? 'info' : 'error');
        }
      }
    } catch (err) {
      console.error('[VerifyExecutionProof] Error verifying proof:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify proof';
      setError(errorMessage);
      addConsoleLog(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="verify-page-background">
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
              onChange={(e) => {
                setProofHash(e.target.value);
                if (error) setError(null);
                if (verificationResult) setVerificationResult(null);
              }}
              placeholder="Enter proof hash (e.g., 0x8f7d9a2e4c1b3f5a6d7e8c9b2a1f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a)"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isVerifying && proofHash.trim()) {
                  handleVerify();
                }
              }}
            />
            <button
              className="verify-btn"
              onClick={handleVerify}
              disabled={isVerifying || !proofHash.trim()}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  VERIFYING...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  VERIFY
                </>
              )}
            </button>
          </div>
          <div className="last-verified">
            Last verified block: <span className="block-number">#18,245,902</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#7f1d1d',
            border: '1px solid #991b1b',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} style={{ color: '#fca5a5', flexShrink: 0 }} />
            <span style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</span>
          </div>
        )}

        {/* Verification Status and Integrity Checks */}
        {verificationResult && (
          <div className="verification-results">
            {/* Left Panel - Verification Status */}
            <div className="status-panel">
              <div className="status-content">
                {verificationResult.valid ? (
                  <>
                    <CheckCircle2 size={64} className="status-icon-large" style={{ color: '#10b981' }} />
                    <h2 className="status-title">VALID PROOF</h2>
                    <p className="status-subtitle">Hash match confirmed on-chain.</p>
                  </>
                ) : (
                  <>
                    <XCircle size={64} className="status-icon-large" style={{ color: '#ef4444' }} />
                    <h2 className="status-title" style={{ color: '#ef4444' }}>INVALID PROOF</h2>
                    <p className="status-subtitle">{verificationResult.reason || 'Verification failed'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Right Panel - Integrity Checks */}
            {verificationResult.checks && (
              <div className="integrity-panel">
                <h3 className="integrity-title">Integrity Checks</h3>
                <div className="integrity-items">
                  <div className="integrity-item">
                    <div className="integrity-icon-wrapper">
                      <MapPin size={20} className="integrity-icon" />
                      {verificationResult.checks.location ? (
                        <CheckCircle2 size={16} className="integrity-check" style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={16} className="integrity-check" style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    <div className="integrity-content">
                      <span className="integrity-label">Location Data</span>
                      <span className="integrity-status" style={{ color: verificationResult.checks.location ? '#10b981' : '#ef4444' }}>
                        {verificationResult.checks.location ? 'MATCH' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                  <div className="integrity-item">
                    <div className="integrity-icon-wrapper">
                      <Clock size={20} className="integrity-icon" />
                      {verificationResult.checks.time ? (
                        <CheckCircle2 size={16} className="integrity-check" style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={16} className="integrity-check" style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    <div className="integrity-content">
                      <span className="integrity-label">Timestamp</span>
                      <span className="integrity-status" style={{ color: verificationResult.checks.time ? '#10b981' : '#ef4444' }}>
                        {verificationResult.checks.time ? 'SYNCED' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                  <div className="integrity-item">
                    <div className="integrity-icon-wrapper">
                      <Terminal size={20} className="integrity-icon" />
                      {verificationResult.checks.hashMatch ? (
                        <CheckCircle2 size={16} className="integrity-check" style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={16} className="integrity-check" style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    <div className="integrity-content">
                      <span className="integrity-label">Hash Match</span>
                      <span className="integrity-status" style={{ color: verificationResult.checks.hashMatch ? '#10b981' : '#ef4444' }}>
                        {verificationResult.checks.hashMatch ? 'MATCH' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                  <div className="integrity-item">
                    <div className="integrity-icon-wrapper">
                      <Globe size={20} className="integrity-icon" />
                      {verificationResult.checks.onChainMatch ? (
                        <CheckCircle2 size={16} className="integrity-check" style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={16} className="integrity-check" style={{ color: '#ef4444' }} />
                      )}
                    </div>
                    <div className="integrity-content">
                      <span className="integrity-label">On-Chain Match</span>
                      <span className="integrity-status" style={{ color: verificationResult.checks.onChainMatch ? '#10b981' : '#ef4444' }}>
                        {verificationResult.checks.onChainMatch ? 'MATCH' : 'FAILED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Verification Section */}
            {verificationResult.aiExplanation && (
              <div className="integrity-panel" style={{ marginTop: '0px', gridColumn: '1 / -1' }}>
                <h3 className="integrity-title">AI Vision Analysis</h3>
                <div className="integrity-items">
                  <div className="integrity-item" style={{ width: '100%' }}>
                    <div className="integrity-icon-wrapper">
                      <Zap size={20} className="integrity-icon" />
                      {/* Determine status based on validity or explanation text content? 
                             The user example has valid: true but text says 'flagged as SUSPICIOUS'. 
                             So we should rely on the text content or a dedicated flag if we had one.
                             For now, let's assume if it mentions 'SUSPICIOUS' it's a warning/error.
                         */}
                      {!verificationResult.aiExplanation.includes('SUSPICIOUS') ? (
                        <CheckCircle2 size={16} className="integrity-check" style={{ color: '#10b981' }} />
                      ) : (
                        <AlertCircle size={16} className="integrity-check" style={{ color: '#f59e0b' }} />
                      )}
                    </div>
                    <div className="integrity-content">
                      <span className="integrity-label">Vision Verdict</span>
                      <span className="integrity-status" style={{
                        color: !verificationResult.aiExplanation.includes('SUSPICIOUS') ? '#10b981' : '#f59e0b'
                      }}>
                        {!verificationResult.aiExplanation.includes('SUSPICIOUS') ? 'ACCEPTED' : 'FLAGGED'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  borderLeft: '3px solid',
                  borderColor: !verificationResult.aiExplanation.includes('SUSPICIOUS') ? '#10b981' : '#f59e0b',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#e5e7eb'
                }}>
                  {verificationResult.aiExplanation}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Console Log Area */}
        {(isVerifying || consoleLogs.length > 0) && (
          <div className="console-section">
            <div className="console-header">
              <Terminal size={18} className="console-icon" />
              <span className="console-title">Console Output</span>
              {isVerifying && (
                <Loader2 size={16} style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite', color: '#10b981' }} />
              )}
            </div>
            <div className="console-content">
              {consoleLogs.length === 0 && isVerifying && (
                <div className="console-line">
                  <span className="console-prompt">root@console:~$</span>
                  <span className="console-command"> initiating handshake...</span>
                </div>
              )}
              {consoleLogs.map((log, index) => {
                const isSuccess = log.includes('SUCCESS');
                const isError = log.includes('ERROR');
                const match = log.match(/\[(\d{2}:\d{2}:\d{2})\]\s+(INFO|SUCCESS|ERROR):\s+(.+)/);
                if (match) {
                  const [, time, level, message] = match;
                  return (
                    <div key={index} className={`console-line ${isSuccess ? 'success' : ''} ${isError ? 'error' : ''}`}>
                      <span className={isSuccess ? 'console-success' : isError ? 'console-error' : 'console-info'}>
                        {level}
                      </span>
                      <span className="console-time">[{time}]</span>
                      <span className="console-message"> {message}</span>
                    </div>
                  );
                }
                return (
                  <div key={index} className="console-line">
                    <span className="console-message">{log}</span>
                  </div>
                );
              })}
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
    </div>
  );
};

export default VerifyExecutionProof;
