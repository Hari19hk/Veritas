import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import './LandingPage.css';
import {
  Shield,
  Cpu,
  FileCheck,
  Zap,
  CheckCircle,
  FileText,
  X
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Using static paths from public/assets to ensure reliable loading
const images = {
  timeline_task_planning: "/assets/timeline_task_planning.svg",
  timeline_gateway_rules: "/assets/timeline_gateway_rules.svg",
  timeline_secure_upload: "/assets/timeline_secure_upload.svg",
  timeline_execution_engine: "/assets/timeline_execution_engine.svg",
  timeline_proof_generation: "/assets/timeline_proof_generation.svg",
  timeline_blockchain_finality: "/assets/timeline_blockchain_finality.svg"
};

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleExecuteClick = () => {
    if (loading) return;
    if (user) {
      navigate('/app/dashboard');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleVerifyClick = () => {
    navigate('/verify');
  };

  const steps = [
    {
      id: 1,
      role: "Task Planner",
      title: "Task Planning",
      desc: "The supply chain initiator defines the computational logic for the task, specifying input formats, processing requirements, and expected production outputs.",
      img: "timeline_task_planning",
      log: { logic: "Supply_Chain_v2.1", format: "JSON_Schema", hash: "0x72a...91b" }
    },
    {
      id: 2,
      role: "Gateway",
      title: "Policy Validation",
      desc: "The decentralized gateway validates the incoming task against network consensus rules. It ensures the request originates from a verified supplier.",
      img: "timeline_gateway_rules",
      log: { rules: "Consensus_v4", status: "Verified", net: "BlockShi_Mainnet" }
    },
    {
      id: 3,
      role: "Secure Upload",
      title: "Data Encryption",
      desc: "Sensitive logistics data is encrypted client-side. The payload is securely anchored to decentralized storage (IPFS), ensuring data sovereignty.",
      img: "timeline_secure_upload",
      log: { cipher: "AES-256-GCM", storage: "IPFS_v1.2", anchor: "Root_Tree" }
    },
    {
      id: 4,
      role: "Execution Engine",
      title: "Secure Computation",
      desc: "Selected nodes execute the workload within a Trusted Execution Environment (TEE). This isolation guarantees exactly specified execution.",
      img: "timeline_execution_engine",
      log: { enclave: "Intel_SGX_v2", memory: "Encrypted", integrity: "Verified" }
    },
    {
      id: 5,
      role: "Proof Generation",
      title: "ZK-Proof Generation",
      desc: "The engine generates a succinct Zero-Knowledge Proof (zk-SNARK). This certifies output matches specifications without revealing secrets.",
      img: "timeline_proof_generation",
      log: { type: "zk-SNARK", circuit: "Groth16", time: "1240ms" }
    },
    {
      id: 6,
      role: "Finality",
      title: "On-Chain Settlement",
      desc: "The proof is anchored to the main blockchain. Once verified by the smart contract, the result is immutably anchored to the ledger.",
      img: "timeline_blockchain_finality",
      log: { block: "12,401,982", sig: "Ed25519", state: "Immutable" }
    }
  ];

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Active when in middle 20% of viewport
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          setActiveStep(index);
        }
      });
    }, options);

    const items = document.querySelectorAll('.timeline-item');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`landing-container ${showLoginModal ? 'modal-open' : ''}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Shield className="text-green-500" size={24} />
          <span>BlockShi</span>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <span className="nav-link" onClick={handleVerifyClick} style={{ cursor: 'pointer' }}>Verify Proof</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="grid-overlay"></div>
          <div className="glow-sphere"></div>
          <div className="floating-shapes">
            <span className="shape s1"></span>
            <span className="shape s2"></span>
            <span className="shape s3"></span>
          </div>
          <div className="data-points">
            {[...Array(12)].map((_, i) => (
              <span key={i} className={`data-point p${i}`}></span>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-pill">
            <span className="pill-dot"></span>
            ✨ Re-imagining AI Trust
          </div>
          <h1 className="hero-title">
            Proof of <span className="text-gradient">Execution</span>
          </h1>
          <p className="hero-subtitle">
            The enterprise standard for AI workload integrity.
            Generate immutable proofs for every compute cycle.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleExecuteClick}>
              <Zap size={18} />
              Execute a Task
            </button>
            <button className="btn btn-secondary" onClick={handleVerifyClick}>
              <Shield size={18} />
              Verify a Proof
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Engineered for Trust</h2>
          <p className="section-subtitle">Transparent verification for modern AI infrastructure.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FileText size={24} />
            </div>
            <h3>Immutable Logs</h3>
            <p>Every execution step is cryptographically signed and stored on a tamper-proof ledger.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Cpu size={24} />
            </div>
            <h3>Model Identity</h3>
            <p>Cryptographically verify the exact model architecture and weights used for each task.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FileCheck size={24} />
            </div>
            <h3>Audit Trails</h3>
            <p>Zero-knowledge proofs provide mathematical certainty of correct execution without exposing data.</p>
          </div>
        </div>
      </section>

      {/* Timeline Section (Parallax) */}
      <section id="how-it-works" className="timeline-section">
        <div className="section-header">
          <h2 className="section-title">How task verification works</h2>
          <p className="section-subtitle">End-to-end chain of custody for compute.</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-steps">
            <div className="timeline-line"></div>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`timeline-item ${index === activeStep ? 'active' : ''}`}
                data-index={index}
              >
                <div className="timeline-marker">
                  <div className="timeline-icon">{step.id}</div>
                </div>
                <div className="timeline-content">
                  <h4>{step.role}</h4>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <div className="timeline-log">
                    {Object.entries(step.log).map(([key, val]) => (
                      <div key={key} className="log-line">
                        <span className="log-label">{key}:</span>
                        <span className="log-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="timeline-visual">
            <div className="timeline-sticky">
              {steps.map((step, index) => (
                <img
                  key={step.id}
                  src={images[step.img as keyof typeof images]}
                  alt={step.title}
                  className={`timeline-img ${index === activeStep ? 'visible' : ''}`}
                />
              ))}
              <div className="scan-line"></div>
              <div className="timeline-ruler"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ZK Verification Section */}
      <section id="verification" className="zk-section">
        <div className="zk-background">
          <div className="straight-grid"></div>
          <div className="zk-glow"></div>
        </div>
        <div className="zk-section-wrapper">
          <div className="zk-container">
            <div>
              <div className="hero-pill" style={{ marginLeft: 0 }}>ZK-SNARKs</div>
              <h2 className="section-title">Zero-Knowledge Verification</h2>
              <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
                Use advanced cryptographic proofs to validate computation correctness without revealing sensitive input data or model parameters.
              </p>

              <div className="zk-list">
                <div className="zk-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Mathematical guarantee of execution</span>
                </div>
                <div className="zk-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Input privacy preservation</span>
                </div>
                <div className="zk-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Verifiable computation results</span>
                </div>
              </div>
            </div>

            <div className="code-block">
              <div className="code-line">
                <span className="code-label">Verification Status:</span>
                <span className="code-status">Active</span>
              </div>
              <div className="code-line">
                <span className="code-label">Proof Protocol:</span>
                <span className="code-val">Groth16</span>
              </div>
              <div className="code-line">
                <span className="code-label">Curve:</span>
                <span className="code-val">BN254</span>
              </div>
              <div className="code-line">
                <span className="code-label">Constraint System:</span>
                <span className="code-val">R1CS</span>
              </div>
              <div className="code-line">
                <span className="code-label">Circuit Size:</span>
                <span className="code-val">~2M constraints</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & CTA */}
      <section className="cta-section">
        <h2 className="section-title" style={{ fontSize: '2rem' }}>Ready to secure your AI infrastructure?</h2>
        <div className="hero-buttons" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleExecuteClick}>
            Get Started Now
          </button>
          <button className="btn btn-secondary">
            Contact Sales
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div>
            &copy; 2026 BlockShi. All rights reserved.
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Status</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>
              <X size={20} />
            </button>
            <div className="login-modal-content">
              <div className="login-logo">
                <Shield size={40} className="text-green-500" />
              </div>
              <h2 className="login-title">Welcome to BlockShi</h2>
              <p className="login-subtitle">Secure your AI infrastructure with Proof of Execution.</p>

              <button
                className="google-login-btn"
                onClick={loginWithGoogle}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#ffffff" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <p className="login-footer">
                By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
