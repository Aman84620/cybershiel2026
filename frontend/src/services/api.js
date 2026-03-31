const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const analyzeContent = async (formData) => {
  try {
    const result = await request('/analyze', {
      method: 'POST',
      body: formData,
    });
    
    // Fallback local storage saving
    if (result) {
      try {
        const existing = JSON.parse(localStorage.getItem('localScans') || '[]');
        const localRecord = { 
          ...result, 
          timestamp: new Date().toISOString(),
          id: result.id || `loc_${Date.now()}` 
        };
        localStorage.setItem('localScans', JSON.stringify([localRecord, ...existing]));
      } catch (e) {
        console.error('Local storage save failed', e);
      }
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const checkCompany = async (companyName, domain) => {
  return request('/company-check', {
    method: 'POST',
    body: JSON.stringify({ companyName, domain }),
  });
};

export const fileComplaint = async (complaintData) => {
  return request('/complaint', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  });
};

export const getHistory = async () => {
  try {
    const backendData = await request('/history', { method: 'GET' });
    const localScans = JSON.parse(localStorage.getItem('localScans') || '[]');
    
    // Merge backend and local scans, removing duplicates by ID if any
    const merged = [...(backendData.history || []), ...localScans];
    const uniqueScans = Array.from(new Map(merged.map(item => [item.id, item])).values());
    
    return { history: uniqueScans.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)) };
  } catch (error) {
    // If backend completely fails, just return local
    const localScans = JSON.parse(localStorage.getItem('localScans') || '[]');
    return { history: localScans };
  }
};
