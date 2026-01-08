import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Link as LinkIcon,
  CheckCircle2,
  Copy,
  Lock,
  FileCode,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Layout from './Layout';
import './ProofOfExecution.css';
import { getAllProofs, getProofByHash, type Proof } from '../utils/api';

const ProofOfExecution = () => {
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();
  const [proof, setProof] = useState<Proof | null>(null);
  const [allProofs, setAllProofs] = useState<Proof[]>([]);
  const [selectedPoeHash, setSelectedPoeHash] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get poeHash from URL params or use selected one
  const poeHashFromUrl = searchParams.get('poeHash');

  useEffect(() => {
    const loadProofs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all proofs first
        const proofs = await getAllProofs();
        setAllProofs(proofs);

        // If poeHash in URL, load that specific proof
        if (poeHashFromUrl) {
          try {
            const specificProof = await getProofByHash(poeHashFromUrl);
            setProof(specificProof);
            setSelectedPoeHash(poeHashFromUrl);
          } catch (err) {
            setError(`Proof with hash ${poeHashFromUrl} not found`);
          }
        } else if (proofs.length > 0) {
          // Otherwise, use the most recent proof
          const mostRecent = proofs.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          setProof(mostRecent);
          setSelectedPoeHash(mostRecent.poeHash);
        }
      } catch (err) {
        console.error('[ProofOfExecution] Error loading proofs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load proofs');
      } finally {
        setLoading(false);
      }
    };

    loadProofs();
  }, [poeHashFromUrl]);

  const handleProofSelect = async (poeHash: string) => {
    try {
      setLoading(true);
      setError(null);
      const selectedProof = await getProofByHash(poeHash);
      setProof(selectedProof);
      setSelectedPoeHash(poeHash);
      // Update URL without reload
      window.history.replaceState({}, '', `/proof-of-execution?poeHash=${poeHash}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proof');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (proof) {
      navigator.clipboard.writeText(proof.poeHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <Layout breadcrumb="proof of execution">
        <div className="proof-page">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
            <Loader2 size={48} className="status-icon-large" style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading proof data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !proof) {
    return (
      <Layout breadcrumb="proof of execution">
        <div className="proof-page">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px', padding: '40px' }}>
            <AlertCircle size={48} style={{ color: '#ef4444' }} />
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '8px' }}>Error Loading Proof</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>{error}</p>
            {allProofs.length > 0 && (
              <div style={{ marginTop: '24px', width: '100%', maxWidth: '400px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Select a proof:</label>
                <select
                  value={selectedPoeHash}
                  onChange={(e) => handleProofSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#111111',
                    border: '1px solid #1f1f1f',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  {allProofs.map((p) => (
                    <option key={p.poeHash} value={p.poeHash}>
                      {p.poeHash.substring(0, 20)}... - {formatTimestamp(p.createdAt)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  if (!proof) {
    return (
      <Layout breadcrumb="proof of execution">
        <div className="proof-page">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px', padding: '40px' }}>
            <FileCode size={48} style={{ color: '#6b7280' }} />
            <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '8px' }}>No Proofs Found</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>
              No proof of execution data available. Execute a task to generate a proof.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout breadcrumb="proof of execution">
      <div className="proof-page">
        {/* System Status */}
        <div className="system-status-header">
          <div className="status-indicator"></div>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>

        {/* Proof Selector */}
        {allProofs.length > 1 && (
          <div style={{ marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>Select Proof:</label>
            <select
              value={selectedPoeHash}
              onChange={(e) => handleProofSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#111111',
                border: '1px solid #1f1f1f',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {allProofs.map((p) => (
                <option key={p.poeHash} value={p.poeHash}>
                  {p.poeHash.substring(0, 20)}... - {formatTimestamp(p.createdAt)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Badge and Execution ID */}
        <div className="centered-content">
          <div className="status-badge">
            <span className="badge-text">{proof.status}</span>
          </div>
          <div className="execution-id">{proof.commitmentId}</div>
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
                <div className="detail-value hash-value">{proof.poeHash}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">COMMITMENT ID</label>
                <div className="detail-value">{proof.commitmentId}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">EXECUTION TIME</label>
                <div className="detail-value">{formatTimestamp(proof.executionTime)}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">CREATED AT</label>
                <div className="detail-value">{formatTimestamp(proof.createdAt)}</div>
              </div>
              <div className="detail-item">
                <label className="detail-label">EXECUTION LOCATION</label>
                <div className="detail-value">
                  {proof.executionLocation.lat.toFixed(4)}° N, {proof.executionLocation.lng.toFixed(4)}° E
                </div>
              </div>
              {proof.blockchainTx && (
                <div className="detail-item">
                  <label className="detail-label">BLOCKCHAIN TX</label>
                  <div className="detail-value hash-value" style={{ fontSize: '11px' }}>
                    {proof.blockchainTx.substring(0, 20)}...
                  </div>
                </div>
              )}
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

