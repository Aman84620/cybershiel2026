import { Router } from 'express';
import multer from 'multer';
import { analyzeWithAI } from '../services/gemini.js';
import { verifyCompany } from '../services/whois.js';
import { extractTextFromImage, extractTextFromPDF } from '../services/ocr.js';
import { saveAnalysis } from '../services/firebase.js';
import { checkMalware } from '../services/malware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/', upload.any(), async (req, res) => {
  try {
    // DEBUG LOG
    console.log('--- Incoming Request Body ---');
    console.log(JSON.stringify(req.body, null, 2));
    
    const { mode, text, companyName } = req.body;
    const file = req.files && req.files.length > 0 ? req.files[0] : null;

    if (!mode) return res.status(400).json({ message: 'Mode (text/url/image/pdf) is required' });

    let contentText = text || '';
    
    // Step 1: Extract text based on input mode
    console.log(`\n🔍 Analysis request — Mode: ${mode}, Company: ${companyName || 'Unknown'}`);

    if (mode === 'text' || mode === 'url') {
      if (!contentText || !contentText.trim()) {
        console.error('❌ VALIDATION FAILED: Content (text) is missing in the body.');
        return res.status(400).json({ message: 'Content is required. Please paste a message or URL.' });
      }
      contentText = contentText.trim();
      console.log(`  📝 ${mode.toUpperCase()} input: ${contentText.slice(0, 50)}...`);
    } else if (mode === 'image') {
      if (!file) {
        return res.status(400).json({ message: 'Image file is required' });
      }
      console.log(`  📸 Image: ${file.originalname}`);
      contentText = await extractTextFromImage(file.buffer);
    } else if (mode === 'pdf') {
      if (!file) {
        return res.status(400).json({ message: 'PDF file is required' });
      }
      console.log(`  📄 PDF: ${file.originalname}`);
      contentText = await extractTextFromPDF(file.buffer);
    } else {
      return res.status(400).json({ message: 'Invalid mode. Use text, url, image, or pdf' });
    }

    // Step 2: AI Analysis
    console.log('  🤖 Running AI analysis...');
    const aiResult = await analyzeWithAI(contentText, companyName);

    // Step 2.5: Deep Link Extraction & Malware Check
    let malwareReport = null;
    // Regex that finds standard URLs AND domain-like patterns (e.g., amazon.com)
    const urlRegex = /((https?:\/\/)|(www\.))?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,8})(\/[^\s]*)?/gi;
    const foundUrls = contentText.match(urlRegex);
    
    if (foundUrls && foundUrls.length > 0) {
       let targetUrl = foundUrls[0].trim();
       console.log(`  🛡️ Found Link: ${targetUrl}. Scanning threat...`);
       
       // VirusTotal needs a full URL including protocol
       if (!targetUrl.startsWith('http')) {
          targetUrl = 'http://' + targetUrl;
       }
       
       malwareReport = await checkMalware(targetUrl);
    }

    // Step 3: Company Verification
    console.log('  🏢 Verifying company...');
    const companyResult = await verifyCompany(companyName);

    // Step 4: Merge results
    const finalReport = {
      ...aiResult,
      malwareReport,
      companyStatus: companyResult.status || aiResult.companyStatus,
      officialWebsite: companyResult.officialWebsite || '',
      companyDetails: companyResult,
      companyName,
      mode,
      extractedText: contentText.slice(0, 500),
    };

    // Step 5: Save to database
    console.log('  💾 Saving to database...');
    const recordId = await saveAnalysis(finalReport);
    finalReport.id = recordId;

    console.log(`  ✅ Analysis complete — Score: ${finalReport.fraudScore}, Risk: ${finalReport.riskLevel}`);

    res.json(finalReport);
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ message: error.message || 'Analysis failed' });
  }
});

export default router;
