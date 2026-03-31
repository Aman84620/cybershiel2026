import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldAlert, CheckCircle, Shield, 
  Search, Users, RefreshCw, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './AdminDashboard.css';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = {
  safe: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  primary: '#00ff88', // Neon Green
  surface: '#1a2820'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes, compRes] = await Promise.all([
        fetch(`${VITE_API_URL}/admin/stats`),
        fetch(`${VITE_API_URL}/admin/activity`),
        fetch(`${VITE_API_URL}/admin/complaints`)
      ]);

      const localScans = JSON.parse(localStorage.getItem('localScans') || '[]');

      let loadedStats = { overview: { totalAnalyzed: 0, scamsDetected: 0, safeCount: 0, totalComplaints: 0 }, distribution: [], trends: [] };
      let loadedActs = [];
      let loadedComps = [];

      if (statsRes.ok) loadedStats = await statsRes.json();
      if (actRes.ok) loadedActs = (await actRes.json()).activities || [];
      if (compRes.ok) loadedComps = (await compRes.json()).complaints || [];

      // Merge local scans to simulate persistency when DB is down
      const mergedActs = [...loadedActs, ...localScans];
      const uniqueActs = Array.from(new Map(mergedActs.map(item => [item.id, item])).values());
      
      uniqueActs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivities(uniqueActs.slice(0, 20));

      // Overwrite stats with merged data if local has more than backend
      if (uniqueActs.length > loadedStats.overview.totalAnalyzed) {
        loadedStats.overview.totalAnalyzed = uniqueActs.length;
        loadedStats.overview.scamsDetected = uniqueActs.filter(a => a.riskLevel === 'High').length;
        loadedStats.overview.safeCount = uniqueActs.filter(a => a.riskLevel === 'Low').length;
        
        // Distribution
        const critical = uniqueActs.filter(a => (a.fraudScore || 0) > 80).length;
        const susp = uniqueActs.filter(a => (a.fraudScore || 0) > 40 && (a.fraudScore || 0) <= 80).length;
        const safe = uniqueActs.filter(a => (a.fraudScore || 0) <= 40).length;
        loadedStats.distribution = [
          { name: 'Critical Scam', value: critical },
          { name: 'Suspicious', value: susp },
          { name: 'Safe', value: safe }
        ].filter(item => item.value > 0);
      }

      setStats(loadedStats);
      setComplaints(loadedComps);
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
      // Fallback display if complete disconnect
      const localScans = JSON.parse(localStorage.getItem('localScans') || '[]');
      setActivities(localScans.slice(0, 20));
      setStats({
         overview: { 
           totalAnalyzed: localScans.length, 
           scamsDetected: localScans.filter(a => a.riskLevel === 'High').length, 
           safeCount: localScans.filter(a => a.riskLevel === 'Low').length, 
           totalComplaints: 0 
         },
         distribution: [],
         trends: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Simulate real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="admin-loading">
        <Activity className="animate-pulse" size={48} color={COLORS.primary} />
        <h2 className="mono neon-text">INITIALIZING ADMIN SYSTEMS...</h2>
      </div>
    );
  }

  const filteredComplaints = complaints.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard stagger-children">
      
      {/* HEADER */}
      <motion.header className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="section-title">COMMAND CENTER</h1>
          <p className="section-subtitle">Real-time threat monitoring and system analytics</p>
        </div>
        <button className="btn btn-ghost sync-btn" onClick={fetchDashboardData}>
          <RefreshCw size={16} /> <span>SYNC_DATA</span>
        </button>
      </motion.header>

      {/* METRICS ROW */}
      <section className="metrics-grid">
        <MetricCard 
          title="TOTAL_ANALYZED" 
          value={stats?.overview?.totalAnalyzed || 0} 
          icon={Activity} 
          color={COLORS.primary} 
        />
        <MetricCard 
          title="SCAMS_NEUTRALIZED" 
          value={stats?.overview?.scamsDetected || 0} 
          icon={ShieldAlert} 
          color={COLORS.danger} 
        />
        <MetricCard 
          title="SAFE_ENTITIES" 
          value={stats?.overview?.safeCount || 0} 
          icon={CheckCircle} 
          color={COLORS.safe} 
        />
        <MetricCard 
          title="ACTIVE_COMPLAINTS" 
          value={stats?.overview?.totalComplaints || 0} 
          icon={AlertTriangle} 
          color={COLORS.warning} 
        />
      </section>

      {/* CHARTS ROW */}
      <section className="charts-grid">
        <motion.div className="chart-card glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="mono">THREAT_DISTRIBUTION</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats?.distribution || []} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={80} 
                  paddingAngle={5} dataKey="value"
                >
                  {(stats?.distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Safe' ? COLORS.safe : entry.name === 'Suspicious' ? COLORS.warning : COLORS.danger} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.primary}` }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="chart-card glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="mono">ANALYSIS_TREND_7D</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends || []}>
                <defs>
                  <linearGradient id="colorAnalyzed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.primary}` }} />
                <Area type="monotone" dataKey="analyzed" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorAnalyzed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* BOTTOM SECTIONS */}
      <section className="dashboard-bottom">
        {/* COMPLAINTS MANAGEMENT */}
        <motion.div className="complaints-panel glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="panel-header">
            <h3 className="mono">COMPLAINT_LEDGER</h3>
            <div className="search-box">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search queries..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>ENTITY_NAME</th>
                  <th>REPORTER</th>
                  <th>RISK_SCORE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? filteredComplaints.map(comp => (
                  <tr key={comp.id}>
                    <td>{comp.companyName || 'Unknown Corp'}</td>
                    <td>{comp.email}</td>
                    <td>
                      <span className={`score-badge ${comp.fraudScore > 75 ? 'high' : comp.fraudScore > 40 ? 'med' : 'low'}`}>
                        {comp.fraudScore}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${comp.status === 'resolved' ? 'resolved' : 'pending'}`}>
                        {comp.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* LIVE ACTIVITY FEED */}
        <motion.div className="activity-panel glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="mono"><Activity size={16} /> LIVE_FEED</h3>
          <div className="feed-list">
            {activities.map(act => (
              <div key={act.id} className={`feed-item ${act.riskLevel === 'High' ? 'danger-glow' : ''}`}>
                <div className="feed-indicator" style={{ backgroundColor: act.riskLevel === 'High' ? COLORS.danger : COLORS.safe }}></div>
                <div className="feed-content">
                  <p className="feed-text">"{act.inputText?.slice(0, 40)}..."</p>
                  <span className="feed-meta mono">{new Date(act.timestamp).toLocaleTimeString()} - SCORE {act.fraudScore}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <motion.div 
      className="metric-card glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: `0 10px 30px ${color}22` }}
    >
      <div className="metric-icon" style={{ color: color, backgroundColor: `${color}11` }}>
        <Icon size={24} />
      </div>
      <div className="metric-info">
        <h4 className="mono">{title}</h4>
        <motion.span 
          className="metric-value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {value.toLocaleString()}
        </motion.span>
      </div>
    </motion.div>
  );
}
