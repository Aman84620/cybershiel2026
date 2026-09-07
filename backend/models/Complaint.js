import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  fraudScore: { type: Number, default: 0 },
  riskLevel: { type: String, default: 'Unknown' },
  companyName: { type: String, default: 'Unknown' },
  description: { type: String },
  status: { type: String, default: 'submitted' },
  timestamp: { type: Date, default: Date.now }
});

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
export default Complaint;
