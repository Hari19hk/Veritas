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
  FileText
} from 'lucide-react';

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

  const handleExecuteClick = () => {
    if (loading) return;
    if (user) {
      navigate('/app/dashboard');
    } else {
      navigate('/login');
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
      desc: "The supply chain initiator defines the computational logic for the task, specifying input formats, processing requirements, and expected production outputs. This blueprint acts as the smart contract for off-chain computation.",
      img: "timeline_task_planning"
    },
    {
      id: 2,
      role: "Gateway",
      title: "Policy Validation",
      desc: "The decentralized gateway validates the incoming task against network consensus rules. It ensures the request originates from a verified supplier and validates credit availability for the compute resources.",
      img: "timeline_gateway_rules"
    },
    {
      id: 3,
      role: "Secure Upload",
      title: "Data Encryption",
      desc: "Sensitive logistics data—such as manufacturing schematics or proprietary algorithms—is encrypted client-side. The payload is securely anchored to decentralized storage (IPFS), ensuring data sovereignty.",
      img: "timeline_secure_upload"
    },
    {
      id: 4,
      role: "Execution Engine",
      title: "Secure Computation",
      desc: "Selected nodes execute the workload within a Trusted Execution Environment (TEE). This isolation guarantees the supply chain logic runs exactly as specified without interference or data leakage.",
      img: "timeline_execution_engine"
    },
    {
      id: 5,
      role: "Proof Generation",
      title: "ZK-Proof Generation",
      desc: "The engine generates a succinct Zero-Knowledge Proof (zk-SNARK). This mathematically certifies that the production output matches the input specifications without revealing the proprietary trade secrets.",
      img: "timeline_proof_generation"
    },
    {
      id: 6,
      role: "Finality",
      title: "On-Chain Settlement",
      desc: "The proof is submitted to the main blockchain. Once verified by the smart contract, the result is immutably anchored to the ledger, automatically triggering payment releases and downstream logistics.",
      img: "timeline_blockchain_finality"
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
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Shield className="text-green-500" size={24} />
          <span>BlockShi</span>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#verification" className="nav-link">Verification</a>
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>All Systems Operational</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
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
    </div>
  );
};

export default Landing;
