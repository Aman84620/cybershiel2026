import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Lock, Code, Heart } from 'lucide-react';
import './About.css';

const features = [
  { icon: Zap, title: 'AI-Powered Analysis', desc: 'Uses advanced neural models to detect scam patterns, language manipulation, and fraudulent offers.' },
  { icon: Globe, title: 'Company Verification', desc: 'Validates company authenticity through domain and WHOIS lookup.' },
  { icon: Lock, title: 'OCR Processing', desc: 'Extracts text from images and PDFs using advanced OCR technology.' },
  { icon: Code, title: 'Smart Red Flags', desc: 'Identifies specific scam indicators like urgency, hidden fees, and impersonation.' },
];

export default function About() {
  return (
    <div className="about-page">
      <motion.div
        className="about-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="about-shield"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Shield size={64} />
        </motion.div>
        <h1 className="about-title">
          AI Cyber<span className="neon-text">Trust</span> Shield
        </h1>
        <p className="about-tagline">
          Protecting job seekers from fraudulent offers with cutting-edge AI technology
        </p>
      </motion.div>

      <div className="features-grid stagger-children">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="feature-icon">
                <Icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="about-footer glass-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="footer-text">
          Built with <Heart size={14} className="heart-icon" /> for a safer internet
        </p>
        <p className="footer-tech mono">
          Engineered for maximum threat neutralization
        </p>
      </motion.div>
    </div>
  );
}
