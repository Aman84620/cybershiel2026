import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  inputText: { type: String },
  extractedText: { type: String },
  fraudScore: { type: Number, default: 0 },
  riskLevel: { type: String, default: 'Low' },
  mode: { type: String, default: 'text' },
  malwareReport: { type: mongoose.Schema.Types.Mixed },
  companyStatus: { type: String },
  officialWebsite: { type: String },
  companyDetails: { type: mongoose.Schema.Types.Mixed },
  companyName: { type: String },
  summary: { type: String },
  redFlags: [{ type: String }],
  recommendation: { type: String },
  userId: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
export default Analysis;
