import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, ExternalLink,
  Flag, Globe, TrendingUp, Eye, FileWarning, ChevronDown, ChevronUp
} from 'lucide-react';
import './TrustReport.css';

function AnimatedScore({ score, riskLevel }) {
  const [displayScore, setDisplayScore] = useState(0);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let frame;
    let current = 0;
    const increment = score / 60;
    function animate() {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        return;
      }
      setDisplayScore(Math.round(current));
      frame = requestAnimationFrame(animate);
    }
    const timeout = setTimeout(animate, 300);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [score]);

  const getColor = () => {
    if (score <= 30) return '#00ff88';
    if (score <= 65) return '#ffbe0b';
    return '#ff3860';
  };

  return (
    <div className="score-gauge">
      <svg viewBox="0 0 200 200" className="gauge-svg">
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="100" cy="100" r="90" fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ filter: `drop-shadow(0 0 8px ${getColor()})` }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        {/* Tick Marks */}
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 78 * Math.cos(rad);
          const y1 = 100 + 78 * Math.sin(rad);
          const x2 = 100 + 84 * Math.cos(rad);
          const y2 = 100 + 84 * Math.sin(rad);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          );
        })}
      </svg>
      <div className="gauge-center">
        <span className="gauge-value" style={{ color: getColor() }}>{displayScore}</span>
        <span className="gauge-label mono">FRAUD SCORE</span>
      </div>
    </div>
  );
}

export default function TrustReport({ report, onFileComplaint }) {
  const [expandedFlags, setExpandedFlags] = useState(false);

  if (!report) return null;

  const {
    fraudScore = 0,
    riskLevel = 'Low',
    redFlags = [],
    aiExplanation = '',
    companyStatus = 'Unknown',
    officialWebsite = '',
    recommendation = 'Safe',
  } = report;

  const getRiskBadgeClass = () => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'badge-low';
      case 'medium': return 'badge-medium';
      case 'high': return 'badge-high';
      default: return 'badge-low';
    }
  };

  const getRecommendationIcon = () => {
    switch (recommendation.toLowerCase()) {
      case 'safe': return <CheckCircle size={20} />;
      case 'avoid': return <XCircle size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

  const showComplaint = fraudScore > 50 || riskLevel.toLowerCase() === 'high';

  return (
    <motion.div
      className="trust-report"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="report-header">
        <Shield size={24} className="neon-text" />
        <h2 className="section-title">Trust Report</h2>
        <span className={`badge ${getRiskBadgeClass()}`}>
          {riskLevel} RISK
        </span>
      </div>

      <div className="report-grid stagger-children">
        {/* Score Gauge */}
        <motion.div
          className="report-card glass-card score-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedScore score={fraudScore} riskLevel={riskLevel} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="report-card glass-card stats-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="stat-row">
            <TrendingUp size={18} />
            <div>
              <span className="stat-label">Risk Level</span>
              <span className={`stat-value risk-${riskLevel.toLowerCase()}`}>{riskLevel}</span>
            </div>
          </div>
          <div className="stat-row">
            <Globe size={18} />
            <div>
              <span className="stat-label">Company Status</span>
              <span className={`stat-value ${companyStatus.toLowerCase() === 'real' ? 'status-real' : 'status-suspicious'}`}>
                {companyStatus}
              </span>
            </div>
          </div>
          <div className="stat-row">
            <Eye size={18} />
            <div>
              <span className="stat-label">System Verdict</span>
              <span className={`stat-value ${recommendation.toLowerCase() === 'safe' ? 'status-real' : 'rec-' + recommendation.toLowerCase()}`}>
                {recommendation.toLowerCase() === 'safe' ? <Shield size={20} className="neon-green" /> : getRecommendationIcon()}
                {recommendation.toLowerCase() === 'safe' ? 'SECURE' : recommendation}
              </span>
            </div>
          </div>
          
          {/* Malware Scan Section */}
          <div className={`stat-row malware-status ${report.malwareReport?.status === 'Malicious' ? 'danger' : ''}`}>
            <Shield size={18} className={report.malwareReport?.status === 'Malicious' ? 'neon-red' : 'neon-green'} />
            <div>
              <span className="stat-label">Malware Engine</span>
              <span className={`stat-value ${report.malwareReport?.status === 'Malicious' ? 'status-suspicious' : 'status-real'}`}>
                {report.malwareReport ? report.malwareReport.status.toUpperCase() : 'PENDING...'}
              </span>
              {report.malwareReport && (
                <span className="stat-subtext">{report.malwareReport.details}</span>
              )}
            </div>
          </div>

          {officialWebsite && (
            <div className="stat-row">
              <ExternalLink size={18} />
              <div>
                <span className="stat-label">Official Website</span>
                <a href={officialWebsite} target="_blank" rel="noopener noreferrer" className="stat-link">
                  {officialWebsite}
                </a>
              </div>
            </div>
          )}
        </motion.div>

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <motion.div
            className="report-card glass-card flags-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header" onClick={() => setExpandedFlags(!expandedFlags)}>
              <div className="card-header-left">
                <Flag size={18} className="flag-icon" />
                <h3>Red Flags Detected ({redFlags.length})</h3>
              </div>
              {expandedFlags ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            <div className={`flags-list ${expandedFlags ? 'expanded' : ''}`}>
              {redFlags.map((flag, index) => (
                <motion.div
                  key={index}
                  className="flag-item"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <AlertTriangle size={14} className="flag-icon-sm" />
                  <span>{flag}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Threat Intelligence / AI Explanation */}
        <motion.div
          className={`report-card glass-card explanation-card ${fraudScore > 30 ? 'threat-alert' : ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65 }}
        >
          <div className="card-header">
            {fraudScore > 30 ? <Shield size={18} className="neon-red" /> : <FileWarning size={18} />}
            <h3>{fraudScore > 30 ? 'THREAT INTELLIGENCE SUMMARY' : 'AI ANALYSIS RATIONALE'}</h3>
          </div>
          
          <div className="explanation-body">
            <p className="explanation-text">{aiExplanation}</p>
            
            {/* If malware is detected, show it here as well for clarity */}
            {report.malwareReport?.status === 'Malicious' && (
               <div className="threat-detail-item danger">
                  <AlertTriangle size={14} />
                  <span><strong>MALWARE ALERT:</strong> This URL is flagged by {report.malwareReport.maliciousCount} security engines as a confirmed threat.</span>
               </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Complaint Button */}
      {showComplaint && (
        <motion.div
          className="complaint-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            className="btn btn-danger complaint-btn"
            onClick={onFileComplaint}
            id="file-complaint-btn"
          >
            🚨 File Complaint
          </button>
          <p className="complaint-hint">This content has been flagged as potentially fraudulent</p>
        </motion.div>
      )}
    </motion.div>
  );
}
