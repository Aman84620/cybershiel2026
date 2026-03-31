import { Router } from 'express';
import { saveComplaint } from '../services/firebase.js';
import { sendComplaintEmail } from '../services/email.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message, fraudScore, riskLevel, companyName, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    console.log(`\n🚨 Complaint filed by: ${name} <${email}>`);
    console.log(`   Company: ${companyName || 'Not specified'}, Score: ${fraudScore}`);

    // Save to database
    const complaintId = await saveComplaint({
      name,
      email,
      message: message?.slice(0, 1000),
      fraudScore: fraudScore || 0,
      riskLevel: riskLevel || 'Unknown',
      companyName: companyName || 'Unknown',
      description: description?.slice(0, 500),
      status: 'submitted',
    });

    // Send email report
    const emailResult = await sendComplaintEmail({
      name, email, message, fraudScore, riskLevel, companyName, description,
    });

    console.log(`  ✅ Complaint saved: ${complaintId}`);
    console.log(`  📧 Email: ${emailResult.sent ? 'Sent' : 'Failed'}${emailResult.simulated ? ' (simulated)' : ''}`);

    res.json({
      success: true,
      complaintId,
      emailSent: emailResult.sent,
      message: 'Complaint filed successfully',
    });
  } catch (error) {
    console.error('Complaint error:', error);
    res.status(500).json({ message: error.message || 'Failed to file complaint' });
  }
});

export default router;
