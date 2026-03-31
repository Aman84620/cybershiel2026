import dotenv from 'dotenv';

dotenv.config();

export async function verifyCompany(companyName) {
  const apiKey = process.env.WHOIS_API_KEY;

  // Try to construct a likely domain from the company name
  const domainGuess = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    + '.com';

  if (!apiKey) {
    console.warn('⚠️  WHOIS_API_KEY not configured. Using mock company check.');
    return getMockCompanyCheck(companyName, domainGuess);
  }

  try {
    // WhoisJson.com API lookup (using token instead of apiKey)
    const response = await fetch(
      `https://whoisjson.com/api/v1/whois?domain=${domainGuess}&token=${apiKey}`
    );

    if (!response.ok) {
      console.warn(`⚠️ WHOIS API Rejected: ${response.status}`);
      throw new Error(`WHOIS API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Raw WHOIS Data received:', JSON.stringify(data).substring(0, 200));

    // Handle different formats from WhoisJson
    if (!data || (!data.domain && !data.domain_name)) {
      console.warn('⚠️ WHOIS API returned invalid or empty domain data.');
      return {
        companyName,
        domain: domainGuess,
        status: 'Unknown',
        details: 'No WHOIS records found for this domain',
        registrationDate: null,
        registrar: null,
      };
    }

    console.log('✅ WHOIS API (WhoisJson) Successful - Real data fetched!');
    
    // WhoisJson fields can be created_at OR created_date
    const createdDate = data.created_at || data.created_date || data.registration_date || null;
    const registrar = data.registrar || data.registrar_name || 'Generic Registrar';

    // Trust calculation
    let status = 'Real';
    let details = `Registration verified via ${registrar}`;
    
    if (createdDate) {
      const createdYear = new Date(createdDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if ((currentYear - createdYear) < 1) {
        status = 'Suspicious';
        details = `High Risk: Domain is very new (Registered: ${new Date(createdDate).toLocaleDateString()})`;
      }
    }

    return {
      companyName,
      domain: domainGuess,
      status,
      details,
      registrationDate: createdDate,
      registrar,
      officialWebsite: `https://${domainGuess}`,
    };
  } catch (error) {
    console.error('⚠️ WHOIS Engine Error:', error.message);
    return {
      companyName,
      domain: domainGuess,
      status: 'Unknown',
      details: 'Could not verify domain: ' + error.message,
      registrationDate: null,
      expirationDate: null,
      registrar: null,
      officialWebsite: null,
    };
  }
}

function getMockCompanyCheck(companyName, domain) {
  // Well-known companies for demo
  const knownCompanies = [
    'google', 'microsoft', 'amazon', 'apple', 'meta', 'facebook',
    'netflix', 'tesla', 'ibm', 'oracle', 'adobe', 'salesforce',
    'uber', 'airbnb', 'spotify', 'twitter', 'linkedin',
    'infosys', 'tcs', 'wipro', 'accenture', 'deloitte',
  ];

  const isKnown = knownCompanies.some(c => companyName.toLowerCase().includes(c));

  if (isKnown) {
    return {
      companyName,
      domain,
      status: 'Real',
      details: `[DEMO MODE] "${companyName}" is a recognized global company.`,
      registrationDate: '2000-01-01',
      expirationDate: '2030-12-31',
      registrar: 'Demo Registrar',
      officialWebsite: `https://${domain}`,
    };
  }

  return {
    companyName,
    domain,
    status: 'Suspicious',
    details: `[DEMO MODE] "${companyName}" could not be verified. Configure WHOIS_API_KEY for production checks.`,
    registrationDate: null,
    expirationDate: null,
    registrar: null,
    officialWebsite: null,
  };
}
