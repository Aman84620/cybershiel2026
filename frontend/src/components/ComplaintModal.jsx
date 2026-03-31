import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Loader } from 'lucide-react';
import { fileComplaint } from '../services/api';
import './ComplaintModal.css';

export default function ComplaintModal({ isOpen, onClose, report }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: report?.originalText?.slice(0, 500) || 'Suspicious content detected',
    description: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      await fileComplaint({
        ...formData,
        fraudScore: report?.fraudScore || 0,
        riskLevel: report?.riskLevel || 'Unknown',
        companyName: report?.companyName || 'Unknown',
        timestamp: new Date().toISOString(),
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to submit complaint');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setFormData({ name: '', email: '', message: report?.originalText?.slice(0, 500) || '', description: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="modal-content complaint-modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {status === 'success' ? (
              <motion.div
                className="success-panel"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <div className="success-icon-wrap">
                  <CheckCircle size={56} />
                </div>
                <h3>Complaint Filed Successfully</h3>
                <p>Your report has been submitted and saved to our database. An email confirmation has been sent.</p>
                <button className="btn btn-primary" onClick={handleClose} id="complaint-done-btn">
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title">🚨 File a Complaint</h2>
                    <p className="modal-subtitle">Report this suspicious content to our threat database</p>
                  </div>
                  <button className="btn btn-icon btn-ghost" onClick={handleClose} id="close-complaint-modal">
                    <X size={20} />
                  </button>
                </div>

                {/* Auto-filled badges */}
                <div className="auto-filled-info">
                  <div className="auto-badge">
                    <span className="auto-label">Fraud Score</span>
                    <span className="auto-value" style={{ color: (report?.fraudScore || 0) > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                      {report?.fraudScore || 0}/100
                    </span>
                  </div>
                  <div className="auto-badge">
                    <span className="auto-label">Risk Level</span>
                    <span className="auto-value">{report?.riskLevel || 'Unknown'}</span>
                  </div>
                </div>

                <form className="complaint-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="complaint-name">Your Name</label>
                    <input
                      type="text"
                      id="complaint-name"
                      name="name"
                      className="input-field"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="complaint-email">Email Address</label>
                    <input
                      type="email"
                      id="complaint-email"
                      name="email"
                      className="input-field"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="complaint-message">Suspicious Message (Auto-filled)</label>
                    <textarea
                      id="complaint-message"
                      name="message"
                      className="input-field"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="complaint-description">Additional Description</label>
                    <textarea
                      id="complaint-description"
                      name="description"
                      className="input-field"
                      rows={3}
                      placeholder="Provide any additional context about this scam..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  {errorMsg && <p className="form-error">{errorMsg}</p>}

                  <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancel</button>
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={status === 'loading'}
                      id="submit-complaint-btn"
                    >
                      {status === 'loading' ? (
                        <Loader size={18} className="spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      {status === 'loading' ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
