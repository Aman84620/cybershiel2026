import dotenv from 'dotenv';
dotenv.config();

const SCAM_ANALYSIS_PROMPT = `You are an advanced AI cybersecurity analyst specializing in detecting scams and phishing.
Analyze the following content (which could be a message or a URL). 

If a URL/Link is provided:
- Check for Phishing/Cloned sites (e.g., typosquatting like 'googIe.com' instead of 'google.com').
- Analyze domain legitimacy (suspicious extensions like .xyz, .top, .tk).
- Look for deceptive path names or excessive subdomains designed to trick users.

If Text is provided:
- Identify common job scams, internship frauds, or urgent payment requests.

Return ONLY a raw JSON object with this exact structure:
{
  "fraudScore": (number 0-100),
  "riskLevel": ("Low"|"Medium"|"High"),
  "redFlags": ["Reason 1", "Reason 2"],
  "aiExplanation": "Point-to-point tactical reasoning. Max 2 short sentences.",
  "companyStatus": ("Real"|"Suspicious"|"Fake"),
  "recommendation": "Simple actionable verdict like SECURE or AVOID"
}

INDICATORS TO CHECK: 
- Typosquatting (amaz0n, flipkaart)
- Free/Suspicious TLDs (.tk, .xyz, .top)
- Redirection loops
- Excessive subdomains
- Phishing patterns in text content
- Urgency/False scarcity in text content

CONTENT TO ANALYZE:
---
{CONTENT}
---

COMPANY NAME PROVIDED (IF ANY): {COMPANY_NAME}`;

export async function analyzeWithAI(content, companyName) {
  if (!content) throw new Error('Content is required for analysis');

  const prompt = SCAM_ANALYSIS_PROMPT
    .replace('{CONTENT}', content)
    .replace('{COMPANY_NAME}', companyName);

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  // Try Gemini First (Native REST)
  if (geminiKey) {
    try {
      const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
      console.log(`🤖 Attempting NATIVE Google Gemini Scan using: ${modelName}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }]}],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      });

      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log('✅ Gemini Scan Successful!');
        return parseAIResponse(data.candidates[0].content.parts[0].text);
      } else {
        console.warn(`⚠️ Gemini API Rejected: ${res.status} - ${JSON.stringify(data.error || data)}`);
      }
    } catch (err) {
      console.error('⚠️ Gemini Native Fetch Error:', err.message);
    }
  }

  // Try Groq Second
  if (groqKey) {
    try {
      console.log('🤖 Attempting Groq (Llama 3) Scan...');
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        console.log('✅ Groq Scan Successful!');
        return parseAIResponse(data.choices[0].message.content);
      } else {
        console.warn(`⚠️ Groq API Rejected: ${res.status} - ${JSON.stringify(data.error || data)}`);
      }
    } catch (err) {
      console.error('⚠️ Groq Fetch Error:', err.message);
    }
  }

  // FINAL: If APIs actually reached but returned no data, use local fallback as safety net
  console.warn('🛑 API Providers not responding. Using safety algorithm.');
  return getLocalHeuristicAnalysis(content, companyName);
}

function parseAIResponse(responseText) {
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  
  try {
     const parsed = JSON.parse(cleaned);
     return {
       fraudScore: parsed.fraudScore || 0,
       riskLevel: parsed.riskLevel || 'Low',
       redFlags: parsed.redFlags || parsed.keyRedFlags || [],
       aiExplanation: parsed.aiExplanation || 'Analysis detail not generated.',
       companyStatus: parsed.companyStatus || 'Unknown',
       recommendation: parsed.recommendation || 'Caution'
     };
  } catch (e) {
     console.error('JSON Parse Error in response:', cleaned);
     throw new Error('AI returned invalid JSON format');
  }
}

// Global Heuristic Fallback (Runs if all APIs fail)
function getLocalHeuristicAnalysis(content, companyName) {
  const lower = (content || '').toLowerCase();
  let score = 20;
  const flags = [];

  if (lower.includes('urgent')) { score += 20; flags.push('Urgency tactics detected'); }
  if (lower.includes('payment')) { score += 30; flags.push('Request for upfront payment'); }
  if (lower.includes('whatsapp')) { score += 15; flags.push('Informal communication channel'); }
  
  return {
    fraudScore: Math.min(score, 90),
    riskLevel: score > 60 ? 'High' : score > 30 ? 'Medium' : 'Low',
    redFlags: flags.length > 0 ? flags : ['No obvious automated patterns, but stay vigilant.'],
    aiExplanation: "Our primary AI engines are currently experience high traffic. This is a heuristic analysis based on common scam patterns.",
    companyStatus: 'Suspicious',
    recommendation: score > 40 ? 'Avoid' : 'Caution'
  };
}
