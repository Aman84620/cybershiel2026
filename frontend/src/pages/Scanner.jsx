import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ScanSearch, Type, Image, FileText, Building2,
  Upload, Trash2, Send, AlertCircle, Link as LinkIcon
} from 'lucide-react';
import { analyzeContent } from '../services/api';
import ScanningOverlay from '../components/ScanningOverlay';
import TrustReport from '../components/TrustReport';
import ComplaintModal from '../components/ComplaintModal';
import './Scanner.css';

const inputModes = [
  { id: 'text', icon: Type, label: 'Paste Text', description: 'Messages / Chats' },
  { id: 'url', icon: LinkIcon, label: 'Paste Link', description: 'Suspicious URLs' },
  { id: 'image', icon: Image, label: 'Upload Image', description: 'Screenshots' },
  { id: 'pdf', icon: FileText, label: 'Upload PDF', description: 'Documents' },
];

export default function Scanner() {
  const [mode, setMode] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const reportRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setError('');
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAnalyze = async () => {
    setError('');

    if ((mode === 'text' || mode === 'url') && !textInput.trim()) {
      setError(`Please paste a ${mode === 'text' ? 'message content' : 'suspicious link'} to analyze`);
      return;
    }
    if ((mode === 'image' || mode === 'pdf') && !file) {
      setError(`Please upload ${mode === 'image' ? 'an image' : 'a PDF'} file`);
      return;
    }

    setIsScanning(true);
    setReport(null);

    try {
      const formData = new FormData();
      formData.append('companyName', companyName.trim() || 'Unknown Entity');
      formData.append('mode', mode);

      console.log('Frontend Debug: Mode:', mode, 'Content:', textInput);
      
      if (mode === 'text' || mode === 'url') {
        formData.append('text', textInput.trim());
      } else {
        formData.append('file', file);
      }

      const result = await analyzeContent(formData);
      // Add a small delay so scanning animation plays fully
      await new Promise(r => setTimeout(r, 2500));
      setReport({ ...result, originalText: textInput, companyName: companyName.trim() || 'Unknown Entity' });
      
      // Auto-scroll to report so the user doesn't have to scroll manually
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="scanner-page">
      <ScanningOverlay isVisible={isScanning} />

      {/* Hero Header */}
      <motion.div
        className="scanner-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-icon-wrap">
          <ScanSearch size={32} />
        </div>
        <div>
          <h1 className="section-title">Threat Scanner</h1>
          <p className="section-subtitle">
            Analyze messages, screenshots, or documents to detect job & internship scams
          </p>
        </div>
      </motion.div>

      {/* Input Mode Selector */}
      <motion.div
        className="mode-selector stagger-children"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {inputModes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              id={`mode-${m.id}`}
              className={`mode-card glass-card ${mode === m.id ? 'active' : ''}`}
              onClick={() => { setMode(m.id); clearFile(); setError(''); }}
            >
              <Icon size={22} />
              <span className="mode-label">{m.label}</span>
              <span className="mode-desc">{m.description}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Input Area */}
      <motion.div
        className="input-section glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {/* Company Name (always shown) */}
        <div className="company-input-row">
          <Building2 size={20} className="company-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Official Company Name (Optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            id="company-name-input"
          />
        </div>

        {/* URL Input Area */}
        {mode === 'url' && (
          <div className="url-input-wrapper">
             <input 
              type="text"
              className="input-field url-input"
              style={{ fontSize: '1.2rem', padding: '20px' }}
              placeholder="PASTE LINK OR SITE NAME HERE..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              id="url-input-box"
             />
             {textInput && (
              <button 
                className="clear-text-btn" 
                onClick={() => setTextInput('')}
              >
                <Trash2 size={18} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Text Input Area */}
        {mode === 'text' && (
          <div className="text-input-wrapper">
            <textarea
              className="input-field text-input"
              placeholder="PASTE CHAT/EMAIL MESSAGE HERE..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              id="text-input-box"
            />
            {textInput && (
              <button 
                className="clear-text-btn" 
                onClick={() => setTextInput('')}
              >
                <Trash2 size={18} /> Clear
              </button>
            )}
          </div>
        )}

        {/* File Upload */}
        {(mode === 'image' || mode === 'pdf') && (
          <div className="upload-zone" onClick={() => fileRef.current?.click()}>
            <input
              ref={fileRef}
              type="file"
              accept={mode === 'image' ? 'image/*' : '.pdf'}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload-input"
            />
            {file ? (
              <div className="file-preview">
                {filePreview && (
                  <img src={filePreview} alt="Preview" className="file-preview-image" />
                )}
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  id="clear-file-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <Upload size={36} />
                <span className="upload-text">
                  Click to upload {mode === 'image' ? 'an image screenshot' : 'a PDF document'}
                </span>
                <span className="upload-hint">
                  {mode === 'image' ? 'PNG, JPG, WEBP up to 10MB' : 'PDF up to 10MB'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Analyze Button */}
        <button
          className="btn btn-primary analyze-btn"
          onClick={handleAnalyze}
          disabled={isScanning}
          id="analyze-btn"
        >
          <ScanSearch size={20} />
          {isScanning ? 'Analyzing...' : 'Analyze for Threats'}
        </button>
      </motion.div>

      {/* Trust Report */}
      {report && (
        <div ref={reportRef} className="report-scroll-target">
          <TrustReport
            report={report}
            onFileComplaint={() => setShowComplaint(true)}
          />
        </div>
      )}

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={showComplaint}
        onClose={() => setShowComplaint(false)}
        report={report}
      />
    </div>
  );
}
