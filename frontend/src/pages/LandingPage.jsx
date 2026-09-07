import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Activity, ChevronRight, Fingerprint, Database, Cpu, UserCircle, ShieldAlert, Mail, User, KeyRound } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [authRole, setAuthRole] = useState('user'); // 'user' or 'admin'
  const [authTab, setAuthTab] = useState('signin'); // 'signin' or 'signup'
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const openModal = (role = 'user', tab = 'signin') => {
    setAuthRole(role);
    setAuthTab(tab);
    setErrorMessage('');
    setUsername('');
    setEmail(role === 'admin' ? 'admin@cybershield.com' : '');
    setPassword(role === 'admin' ? 'admin123' : '');
    setShowLogin(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (authRole === 'admin') {
        // Admin Sign In
        const data = await loginUser({ email, password });
        if (data?.user?.role !== 'admin') {
          throw new Error('Unauthorized. Administrator credentials required.');
        }
        setShowLogin(false);
        navigate('/dashboard');
      } else if (authTab === 'signup') {
        // User Sign Up
        await registerUser({ username, email, password });
        setShowLogin(false);
        navigate('/scanner');
      } else {
        // User Sign In
        await loginUser({ email, password });
        setShowLogin(false);
        navigate('/scanner');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        {/* Navigation / Header */}
        <header className="landing-header">
          <div className="logo-area">
            <Shield size={28} className="text-primary glow-icon" />
            <span className="logo-text-large">CyberTrust <span className="logo-badge">AI</span></span>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn-outline glow-on-hover" onClick={() => openModal('user', 'signin')}>
              Sign In
            </button>
            <button className="btn-primary cyber-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => openModal('user', 'signup')}>
              Sign Up
            </button>
            <button className="btn-outline glow-on-hover admin-login-btn" onClick={() => openModal('admin', 'signin')}>
              <ShieldAlert size={16} className="icon-left" /> Admin
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
              onClick={() => !isSubmitting && setShowLogin(false)}
            >
              <motion.div 
                className={`login-modal glass-card ${authRole === 'admin' ? 'admin-theme' : ''}`}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '90%', maxWidth: '440px', padding: '2rem', borderRadius: '16px' }}
              >
                <div className="modal-header" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  {authRole === 'admin' ? <ShieldAlert size={32} className="text-danger" style={{ margin: '0 auto 0.5rem' }} /> : <Shield size={32} className="text-primary" style={{ margin: '0 auto 0.5rem' }} />}
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                    {authRole === 'admin' ? 'ADMINISTRATOR PORTAL' : authTab === 'signup' ? 'CREATE SECURE ACCOUNT' : 'USER SIGN IN'}
                  </h2>
                </div>

                {authRole !== 'admin' && (
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => { setAuthTab('signin'); setErrorMessage(''); }}
                      style={{
                        flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                        background: authTab === 'signin' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                        color: authTab === 'signin' ? '#00ff88' : 'rgba(255,255,255,0.6)', fontWeight: 'bold'
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthTab('signup'); setErrorMessage(''); }}
                      style={{
                        flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                        background: authTab === 'signup' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                        color: authTab === 'signup' ? '#00ff88' : 'rgba(255,255,255,0.6)', fontWeight: 'bold'
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {authRole !== 'admin' && authTab === 'signup' && (
                    <div className="form-group">
                      <label className="mono" style={{ fontSize: '0.75rem', color: '#00ff88', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} /> FULL NAME / USERNAME
                      </label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="John Doe" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="mono" style={{ fontSize: '0.75rem', color: authRole === 'admin' ? '#ef4444' : '#00ff88', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} /> {authRole === 'admin' ? 'ADMIN EMAIL ADDRESS' : 'EMAIL ADDRESS'}
                    </label>
                    <input 
                      type="email" 
                      className="input-field" 
                      placeholder={authRole === 'admin' ? "admin@cybershield.com" : "user@example.com"} 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="mono" style={{ fontSize: '0.75rem', color: authRole === 'admin' ? '#ef4444' : '#00ff88', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={14} /> PASSWORD
                    </label>
                    <input 
                      type="password" 
                      className="input-field" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`btn ${authRole === 'admin' ? 'btn-danger' : 'btn-primary'} login-btn`} 
                    disabled={isSubmitting}
                    style={{ marginTop: '0.5rem', padding: '0.75rem', fontWeight: 'bold' }}
                  >
                    {isSubmitting ? 'AUTHENTICATING...' : authRole === 'admin' ? 'AUTHORIZE ADMIN ACCESS' : authTab === 'signup' ? 'REGISTER ACCOUNT' : 'SIGN IN'}
                  </button>
                </form>

                {authRole === 'admin' && (
                  <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    Configured admin email: <span style={{ color: '#fff', fontFamily: 'monospace' }}>admin@cybershield.com</span>
                  </p>
                )}
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
