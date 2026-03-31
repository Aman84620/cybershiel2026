import { Router } from 'express';
import { verifyCompany } from '../services/whois.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    console.log(`\n🏢 Company check request: "${companyName}"`);
    const result = await verifyCompany(companyName.trim());

    console.log(`  ✅ Company status: ${result.status}`);
    res.json(result);
  } catch (error) {
    console.error('Company check error:', error);
    res.status(500).json({ message: error.message || 'Company verification failed' });
  }
});

export default router;
