import { Router } from 'express';
import { getAnalyses } from '../services/firebase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const analyses = await getAnalyses();
    res.json({ history: analyses });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

export default router;
