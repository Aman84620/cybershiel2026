const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

export const setAuthToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem('jwt_token', token);
  } else {
    sessionStorage.setItem('jwt_token', token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('jwt_token');
  sessionStorage.removeItem('jwt_token');
  localStorage.removeItem('jwt_user');
  localStorage.removeItem('userRole');
};

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
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

export const loginUser = async (credentials) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data?.token) {
    setAuthToken(data.token);
    if (data.user) {
      localStorage.setItem('jwt_user', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role || 'user');
    }
  }
  return data;
};

export const registerUser = async (userData) => {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (data?.token) {
    setAuthToken(data.token);
    if (data.user) {
      localStorage.setItem('jwt_user', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role || 'user');
    }
  }
  return data;
};

export const logoutUser = () => {
  removeAuthToken();
};

export const fetchCurrentUser = async () => {
  try {
    return await request('/auth/me', { method: 'GET' });
  } catch (err) {
    removeAuthToken();
    return null;
  }
};

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
