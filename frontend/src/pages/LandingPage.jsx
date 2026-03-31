import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Activity, ChevronRight, Fingerprint, Database, Cpu, UserCircle, ShieldAlert } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loginType, setLoginType] = useState('client'); // 'client' or 'admin'
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const openModal = (type) => {
    setLoginType(type);
    setShowLogin(true);
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      localStorage.setItem('userRole', loginType);
      if (loginType === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/scanner');
      }
    }, 1500); // Simulate authenticating delay
  };

  return (
    <div className="landing-page">
      {/* Animated Matrix/Cyber Background Elements are handled globally by MatrixBackground, 
          but we overlay marketing content here */}
      
      <div className="landing-content">
        {/* Navigation / Header simple */}
        <header className="landing-header">
          <div className="logo-area">
            <Shield size={28} className="text-primary glow-icon" />
            <span className="logo-text-large">CyberTrust <span className="logo-badge">AI</span></span>
          </div>
          <div className="header-actions">
            <button className="btn-outline glow-on-hover admin-login-btn" onClick={() => openModal('admin')}>
              <ShieldAlert size={18} className="icon-left" /> Admin
            </button>
          </div>
        </header>

        <AnimatePresence>
          {showLogin && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingIn && setShowLogin(false)}
            >
              <motion.div 
                className={`login-modal glass-card ${loginType === 'admin' ? 'admin-theme' : ''}`}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  {loginType === 'admin' ? <ShieldAlert size={28} className="text-danger" /> : <Shield size={28} className="text-primary" />}
                  <h2>{loginType === 'admin' ? 'ADMIN COMMAND CENTER' : 'SECURED CLIENT ACCESS'}</h2>
                </div>
                <form onSubmit={handleDemoLogin} className="login-form">
                  <div className="form-group">
                    <label className="mono"><Fingerprint size={14} /> EMAIL_ADDRESS</label>
                    <input type="email" className="input-field" placeholder={loginType === 'admin' ? "admin@cybertrust.com" : "client@domain.com"} defaultValue={loginType === 'admin' ? "admin@cybertrust.com" : "client@domain.com"} required />
                  </div>
                  <div className="form-group">
                    <label className="mono"><Lock size={14} /> PASSWORD</label>
                    <input type="password" className="input-field" placeholder="••••••••" defaultValue={loginType === 'admin' ? "admin123" : "secure1"} required />
                  </div>
                  
                  <button type="submit" className={`btn ${loginType === 'admin' ? 'btn-danger' : 'btn-primary'} login-btn`} disabled={isLoggingIn}>
                    {isLoggingIn ? 'AUTHENTICATING...' : 'AUTHORIZE LOGIN'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="hero-section">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="cyber-title">
              DEFEND YOUR DIGITAL <br /> <span className="cyber-glitch text-primary">FRONTIER</span>
            </h1>
            <p className="cyber-subtitle">
              Military-grade AI intelligence. Real-time threat detection. 
              Zero-day scam neutralization. Trust nothing, verify everything.
            </p>
            
            <div className="hero-actions">
              <button className="btn-primary cyber-btn" onClick={() => openModal('client')}>
                <span className="btn-text">INITIALIZE SHIELD</span>
                <ChevronRight size={20} className="btn-icon" />
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">Scam Detection</span>
              </div>
              <div className="stat">
                <span className="stat-value">&lt;2ms</span>
                <span className="stat-label">Analysis Speed</span>
              </div>
              <div className="stat">
                <span className="stat-value">AES-256</span>
                <span className="stat-label">Encryption</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="cyber-orb">
              <div className="orb-core"></div>
              <div className="orb-ring ring-1"></div>
              <div className="orb-ring ring-2"></div>
              <div className="orb-ring ring-3"></div>
              <Shield size={64} className="orb-icon" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <motion.div 
            className="feature-card glass-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Fingerprint size={32} className="feature-icon" />
            <h3>Identity Verification</h3>
            <p>Cross-references corporate entities with global blacklists and registries instantly.</p>
          </motion.div>
          
          <motion.div 
            className="feature-card glass-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Cpu size={32} className="feature-icon" />
            <h3>Neural Analysis</h3>
            <p>Advanced OCR and NLP models extract and analyze text from any image or document.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Database size={32} className="feature-icon" />
            <h3>Threat Ledger</h3>
            <p>Immutable history of scans and crowd-sourced intelligence on emerging threats.</p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="landing-footer glass-card">
          <div className="footer-content">
            <div className="footer-brand">
              <Shield size={24} className="text-primary" />
              <span className="logo-text-large">CyberTrust Shield</span>
            </div>
            <p className="footer-tagline">"In Trust We Verify."</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#">API Documentation</a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} AI Cyber Trust Shield. All Systems Operational.
          </div>
        </footer>
      </div>
    </div>
  );
}
