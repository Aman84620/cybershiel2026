import { Router } from 'express';
import { getAnalyses, getComplaints } from '../services/firebase.js';

const router = Router();

// Helper to generate a date offset
const getPastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const analyses = await getAnalyses();
    const complaints = await getComplaints();

    // Aggregations from real data
    const totalAnalyzed = analyses.length;
    const scamsDetected = analyses.filter(a => a.riskLevel === 'High').length;
    const safeCount = analyses.filter(a => a.riskLevel === 'Low').length;
    const totalComplaints = complaints.length;

    // Distribution (Pie Chart) - Strictly Real
    const distribution = [
      { name: 'Critical Scam', value: analyses.filter(a => (a.fraudScore || 0) > 80).length },
      { name: 'Suspicious', value: analyses.filter(a => (a.fraudScore || 0) > 40 && (a.fraudScore || 0) <= 80).length },
      { name: 'Safe', value: analyses.filter(a => (a.fraudScore || 0) <= 40).length }
    ].filter(item => item.value > 0); // Hide empty categories

    // Trends (Line/Area charts) - Compute dynamically from last 7 days of real data
    const now = new Date();
    const trends = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86400000);
      const dateString = d.toLocaleDateString('en-US', { weekday: 'short' });
      // Filter analyses for this date
      const dayData = analyses.filter(a => new Date(a.timestamp).toDateString() === d.toDateString());
      return {
        date: dateString,
        analyzed: dayData.length,
        scams: dayData.filter(a => a.riskLevel === 'High').length,
      };
    });

    res.json({
      overview: {
        totalAnalyzed,
        scamsDetected,
        safeCount,
        totalComplaints
      },
      distribution: distribution.length > 0 ? distribution : [{ name: 'No Data', value: 1 }],
      trends
    });
  } catch (error) {
    console.error('Admin API stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/activity
router.get('/activity', async (req, res) => {
  try {
    const analyses = await getAnalyses();
    res.json({ activities: analyses.slice(0, 15) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// GET /api/admin/complaints
router.get('/complaints', async (req, res) => {
  try {
    const complaintsList = await getComplaints();
    res.json({ complaints: complaintsList.slice(0, 50) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

export default router;
