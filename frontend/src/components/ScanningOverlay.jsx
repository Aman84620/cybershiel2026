import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, Activity, Lock, Search, Cpu } from 'lucide-react';
import './ScanningOverlay.css';

const scanSteps = [
  { text: 'Inbound Connection Secure', color: '#00ff88' },
  { text: 'Analyzing Payload Signatures', color: '#00e5ff' },
  { text: 'Scanning Neural Patterns', color: '#a855f7' },
  { text: 'Cross-Checking Global Threat DB', color: '#ffbe0b' },
  { text: 'Isolating Anomalies', color: '#ff3860' },
  { text: 'Authenticating Source Entity', color: '#00e5ff' },
  { text: 'Finalizing Trust Intelligence', color: '#00ff88' },
];

function Globe3D() {
  return (
    <div className="globe-3d-container">
      {/* Outer Rotating Rings */}
      <div className="ring ring-outer" />
      <div className="ring ring-middle" />
      <div className="ring ring-inner" />
      
      {/* 3D Wireframe Sphere */}
      <div className="wireframe-sphere">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="meridian" style={{ transform: `rotateY(${i * 15}deg)` }} />
        ))}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="parallel" style={{ top: `${(i + 1) * 14.28}%` }} />
        ))}
      </div>

      {/* Scanning Beam */}
      <div className="scanning-beam-3d" />

      {/* Center Shield Icon */}
      <div className="center-shield">
        <Shield size={40} strokeWidth={1} />
        <div className="shield-glow" />
      </div>
    </div>
  );
}

export default function ScanningOverlay({ isVisible }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(-1);
      setProgress(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 0.5));
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="tactical-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* HUD Brackets */}
          <div className="hud-corner tl" /><div className="hud-corner tr" />
          <div className="hud-corner bl" /><div className="hud-corner br" />

          {/* Side Panels */}
          <div className="hud-side-panel left">
            <div className="hud-label mono">SYSTEM_LOG</div>
            <div className="hud-log-stream">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="log-line mono">
                  {Math.random().toString(16).slice(2, 10).toUpperCase()} {' >> OK'}
                </div>
              ))}
            </div>
          </div>

          <div className="hud-side-panel right">
            <div className="hud-label mono">THREAT_METRICS</div>
            <div className="metric-box">
              <Activity size={14} />
              <span className="mono">SIG: {Math.floor(progress * 132)}</span>
            </div>
            <div className="metric-box">
              <Lock size={14} />
              <span className="mono">ENC: AES-256</span>
            </div>
          </div>

          {/* Main 3D Animation Section */}
          <div className="scan-center-hub">
            <Globe3D />
            
            <div className="scan-info-block">
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="current-step-msg mono"
              >
                {currentStep >= 0 ? scanSteps[currentStep].text : 'READYING ANALYSIS...'}
              </motion.div>
              
              <div className="hud-progress-container">
                <div className="hud-progress-bar">
                  <motion.div 
                    className="hud-progress-fill" 
                    animate={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="progress-percent mono">{Math.round(progress)}%</div>
              </div>

              <div className="scanning-steps-pills">
                {scanSteps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`step-pill ${i <= currentStep ? 'active' : ''}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hud-footer mono">
            <AlertTriangle size={12} />
            <span>CLASSIFIED ACCESS • LEVEL 4 CLEARANCE REQUIRED</span>
            <AlertTriangle size={12} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
