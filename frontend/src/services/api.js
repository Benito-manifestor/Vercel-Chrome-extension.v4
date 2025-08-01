import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// API service class
class ApiService {
  // Settings endpoints
  async getSettings() {
    const response = await axios.get(`${API}/settings`);
    return response.data;
  }

  async updateSettings(settings) {
    const response = await axios.put(`${API}/settings`, settings);
    return response.data;
  }

  // Deployments endpoints
  async getDeployments(status = null, limit = 50) {
    const params = { limit };
    if (status) params.status = status;
    
    const response = await axios.get(`${API}/deployments`, { params });
    return response.data;
  }

  async createDeployment(deploymentData) {
    const response = await axios.post(`${API}/deployments`, deploymentData);
    return response.data;
  }

  // Stats and activity endpoints
  async getStats() {
    const response = await axios.get(`${API}/stats`);
    return response.data;
  }

  async getRecentActivity(limit = 10) {
    const response = await axios.get(`${API}/activity`, { params: { limit } });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await axios.get(`${API}/`);
    return response.data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();

// Error handling wrapper
const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message || 'An error occurred');
    }
  };
};

// Export wrapped API methods
export const api = {
  settings: {
    get: withErrorHandling(apiService.getSettings.bind(apiService)),
    update: withErrorHandling(apiService.updateSettings.bind(apiService))
  },
  deployments: {
    list: withErrorHandling(apiService.getDeployments.bind(apiService)),
    create: withErrorHandling(apiService.createDeployment.bind(apiService))
  },
  stats: {
    get: withErrorHandling(apiService.getStats.bind(apiService))
  },
  activity: {
    get: withErrorHandling(apiService.getRecentActivity.bind(apiService))
  },
  health: withErrorHandling(apiService.healthCheck.bind(apiService))
};

export default api;