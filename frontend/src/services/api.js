import { getOrCreateSessionId } from '../utils/sessionManager';
import { authAPI } from './auth';

// Use relative URLs in production, localhost in development
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

// Cache auth state to avoid checking on every request
let cachedAuthState = null;
let authCheckPromise = null;

async function checkAuthOnce() {
  if (authCheckPromise) return authCheckPromise;
  
  authCheckPromise = (async () => {
    try {
      const authResponse = await authAPI.getCurrentUser();
      cachedAuthState = authResponse.authenticated;
      return cachedAuthState;
    } catch (error) {
      cachedAuthState = false;
      return false;
    } finally {
      // Reset promise after 5 seconds to allow re-checking
      setTimeout(() => {
        authCheckPromise = null;
      }, 5000);
    }
  })();
  
  return authCheckPromise;
}

// Helper function to make API requests
// For authenticated users: sends cookies (credentials: 'include')
// For guest users: sends session-id header
async function apiRequest(endpoint, options = {}) {
  // Always get session ID (for guest users)
  const sessionId = getOrCreateSessionId();
  
  // Check auth state (cached)
  let isAuthenticated = false;
  try {
    isAuthenticated = await checkAuthOnce();
  } catch (error) {
    // If auth check fails, assume guest
    isAuthenticated = false;
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Always send credentials for potential auth, and session-id for guests
  // Backend will prioritize req.user over req.guestSession
  config.credentials = 'include'; // Send cookies (for authenticated users)
  if (!isAuthenticated) {
    // Guest user - also send session-id header
    config.headers['session-id'] = sessionId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Export function to clear auth cache (call after login/logout)
export function clearAuthCache() {
  cachedAuthState = null;
  authCheckPromise = null;
}

// Make it available globally for auth service
if (typeof window !== 'undefined') {
  window.clearAuthCache = clearAuthCache;
}

// Project API methods
export const projectAPI = {
  // Create a new project
  createProject: async (name, databaseType) => {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, databaseType }),
    });
  },

  // Get all projects for current session
  getAllProjects: async () => {
    return apiRequest('/projects');
  },

  // Get a specific project with its diagram
  getProject: async (id) => {
    return apiRequest(`/projects/${id}`);
  },

  // Update a project
  updateProject: async (id, data) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a project
  deleteProject: async (id) => {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Export project as JSON
  exportProject: async (id) => {
    return apiRequest(`/projects/${id}/export`, {
      method: 'POST',
    });
  },

  // Import project from JSON
  importProject: async (projectData) => {
    return apiRequest('/projects/import', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
};

// Diagram API methods
export const diagramAPI = {
  // Save diagram for a project
  saveDiagram: async (projectId, metadata, nodes, edges) => {
    return apiRequest(`/projects/${projectId}/diagram`, {
      method: 'POST',
      body: JSON.stringify({ metadata, nodes, edges }),
    });
  },

  // Get diagram for a project
  getDiagram: async (projectId) => {
    return apiRequest(`/projects/${projectId}/diagram`);
  },
};

// Utility function to download JSON as file
export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Utility function to read JSON file
export const readJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

