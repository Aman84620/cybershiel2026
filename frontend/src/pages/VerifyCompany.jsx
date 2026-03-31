import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Globe, Briefcase, Search, AlertCircle, 
  ExternalLink, CheckCircle2, ShieldCheck, Info,
  History, Clock, Check
} from 'lucide-react';
import { checkCompany } from '../services/api';
import ScanningOverlay from '../components/ScanningOverlay';
import './VerifyCompany.css';

export default function VerifyCompany() {
  const resultRef = useRef(null);
  const [formData, setFormData] = useState({
    companyName: '',
    domain: '',
    industry: '',
    source: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const response = await checkCompany(formData.companyName, formData.domain);
      
      // Simulate analysis HUD timing
      await new Promise(r => setTimeout(r, 4000));
      setResult(response);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-scroll when result arrives
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [result]);

  return (
    <div className="verify-page">
      <ScanningOverlay isVisible={isVerifying} />

      <motion.div 
        className="verify-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-icon-wrap company-verify">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h1 className="section-title">Verify Company</h1>
          <p className="section-subtitle">
            Perform a deep-dive background check on corporate entities and domains
          </p>
        </div>
      </motion.div>

      <div className="verify-container">
        <motion.form 
          className="verify-form glass-card"
          onSubmit={handleVerify}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="form-group">
            <label className="mono"><Building2 size={14} /> COMPANY_NAME*</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. Google LLC"
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="mono"><Globe size={14} /> OFFICIAL_DOMAIN*</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. google.com"
              value={formData.domain}
              onChange={e => setFormData({...formData, domain: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="mono"><Briefcase size={14} /> INDUSTRY</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="e.g. Technology"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="mono"><Search size={14} /> SOURCE</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="e.g. LinkedIn, Indeed"
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button className="btn btn-primary verify-btn" disabled={isVerifying}>
            <ShieldCheck size={20} />
            {isVerifying ? 'VERIFYING...' : 'START DEEP VERIFICATION'}
          </button>
        </motion.form>

        <div className="verify-info-panel" ref={resultRef}>
          {!result && (
            <motion.div 
              className="info-card glass-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mono"><Info size={16} /> ENTITY_ANALYSIS</h3>
              <p>
                Verify the company entity using our advanced cybersecurity engine.
                The AI system actively cross-references provided details against global threat ledgers, evaluates domain registration patterns, and runs predictive models to determine the legitimacy and security posture of the organization in real-time.
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div 
                className={`result-summary glass-card ${result.status === 'Real' ? 'safe' : 'danger'}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                <div className="result-header">
                  <div className={`status-badge ${result.status === 'Real' ? 'status-safe' : 'status-danger'}`}>
                    {result.status === 'Real' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {result.status === 'Real' ? 'VERIFIED' : 'SUSPICIOUS'}
                  </div>
                  <h3 className="mono">{result.companyName.toUpperCase()}</h3>
                </div>

                <div className="intel-grid">
                  <div className="intel-item">
                    <span className="intel-label">DOMAIN</span>
                    <span className="intel-value">{result.domain}</span>
                  </div>
                  <div className="intel-item">
                    <span className="intel-label">REGISTRAR</span>
                    <span className="intel-value">{result.registrar || 'Protected'}</span>
                  </div>
                  {result.registrationDate && (
                    <div className="intel-item">
                      <span className="intel-label">REG_DATE</span>
                      <span className="intel-value">{new Date(result.registrationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="threat-intel-box">
                  <h4 className="mono"><ShieldCheck size={14} /> THREAT_ANALYSIS_RATIONALE</h4>
                  <p className="intel-details">{result.details}</p>
                </div>

                {result.status === 'Real' && (
                  <div className="verification-stamp">
                    <Check size={12} /> SECURE ENTITY IDENTIFIED
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
