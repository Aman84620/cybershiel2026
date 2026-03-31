import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, Shield, Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getHistory } from '../services/api';
import './History.css';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory();
      setRecords(data.history || []);
    } catch (err) {
      setError('Failed to load scan history');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'var(--neon-green)';
      case 'medium': return 'var(--neon-amber)';
      case 'high': return 'var(--neon-red)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="history-page">
      <motion.div
        className="scanner-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-icon-wrap">
          <HistoryIcon size={32} />
        </div>
        <div>
          <h1 className="section-title">Scan History</h1>
          <p className="section-subtitle">Review past threat analysis results</p>
        </div>
        <button className="btn btn-ghost refresh-btn" onClick={fetchHistory} id="refresh-history">
          <RefreshCw size={16} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="history-skeleton stagger-children">
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="history-empty glass-card">
          <AlertTriangle size={40} />
          <h3>{error}</h3>
          <button className="btn btn-primary" onClick={fetchHistory}>Retry</button>
        </div>
      ) : records.length === 0 ? (
        <motion.div
          className="history-empty glass-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Shield size={48} />
          <h3>No Scans Yet</h3>
          <p>Your threat analysis history will appear here after your first scan.</p>
        </motion.div>
      ) : (
        <div className="history-list stagger-children">
          {records.map((record, index) => (
            <motion.div
              key={record.id || index}
              className="history-item glass-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="history-score" style={{ color: getRiskColor(record.riskLevel) }}>
                {record.fraudScore}
              </div>
              <div className="history-details">
                <div className="history-company">
                  {record.companyName || 'Unknown Company'}
                </div>
                <div className="history-meta">
                  <span className={`badge badge-${record.riskLevel?.toLowerCase() || 'low'}`}>
                    {record.riskLevel || 'Unknown'}
                  </span>
                  <span className="history-date">
                    <Clock size={12} />
                    {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <p className="history-summary">{record.recommendation || 'No recommendation'}</p>
              </div>
              <div className="history-status">
                {record.fraudScore > 50 ? (
                  <AlertTriangle size={20} style={{ color: 'var(--neon-red)' }} />
                ) : (
                  <CheckCircle size={20} style={{ color: 'var(--neon-green)' }} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
