import { getOrCreateSessionId } from '../utils/sessionManager';

// Use relative URLs in production, localhost in development
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

// Helper function to make API requests with session header
async function apiRequest(endpoint, options = {}) {
  const sessionId = getOrCreateSessionId();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'session-id': sessionId,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
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

