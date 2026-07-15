// Auth API service
// Use relative URLs in production, localhost in development
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

// Helper function to make authenticated API requests
async function authRequest(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: 'include', // IMPORTANT: This sends cookies (session)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export const authAPI = {
  // Check if user is currently logged in
  getCurrentUser: async () => {
    try {
      const response = await authRequest('/auth/me');
      return response;
    } catch (error) {
      // If not authenticated, return null
      if (error.message.includes('401') || error.message.includes('Not authenticated')) {
        return { authenticated: false, user: null };
      }
      throw error;
    }
  },

  // Initiate Google OAuth login (redirects to Google)
  login: () => {
    const loginUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = loginUrl;
  },

  // Logout
  logout: async () => {
    try {
      await authRequest('/auth/logout', {
        method: 'POST',
      });
      // Clear auth cache
      if (typeof window !== 'undefined' && window.clearAuthCache) {
        window.clearAuthCache();
      }
      // Redirect to home after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      window.location.href = '/';
    }
  },
};

