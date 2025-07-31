import axios from 'axios';
import { auth } from './firebase';
import { playErrorSound, playSuccessSound } from '../utils/soundSystem';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Play success sound for successful requests
    if (response.config.method !== 'get') {
      playSuccessSound();
    }
    return response;
  },
  (error) => {
    // Play error sound for failed requests
    playErrorSound();
    
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Unauthorized access - redirecting to login');
          // Handle logout or redirect to login
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', data?.detail || error.message);
      }
    } else if (error.request) {
      console.error('Network error - no response received');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('API health check failed');
    }
  },

  // Career and Skill Tree endpoints
  async getSkillTree(careerName) {
    try {
      const response = await api.get(`/api/skill-tree/${encodeURIComponent(careerName)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get skill tree for ${careerName}`);
    }
  },

  async generateSkillTree(careerRequest) {
    try {
      const response = await api.post('/api/skill-tree', careerRequest);
      return response.data;
    } catch (error) {
      throw new Error('Failed to generate skill tree');
    }
  },

  async getAvailableCareers() {
    try {
      const response = await api.get('/api/careers');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get available careers');
    }
  },

  // User Progress endpoints
  async updateUserProgress(progressData) {
    try {
      const response = await api.post('/api/user/progress', progressData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update user progress');
    }
  },

  async getUserProgress() {
    try {
      const response = await api.get('/api/user/progress');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user progress');
    }
  },

  // Skill management
  async completeSkill(skillId, proofLink = null) {
    try {
      const progressData = {
        skill_id: skillId,
        completed: true,
        proof_link: proofLink,
      };
      return await this.updateUserProgress(progressData);
    } catch (error) {
      throw new Error(`Failed to complete skill: ${skillId}`);
    }
  },

  async uncompleteSkill(skillId) {
    try {
      const progressData = {
        skill_id: skillId,
        completed: false,
        proof_link: null,
      };
      return await this.updateUserProgress(progressData);
    } catch (error) {
      throw new Error(`Failed to uncomplete skill: ${skillId}`);
    }
  },

  // User profile and preferences
  async updateUserPreferences(preferences) {
    try {
      const response = await api.put('/api/user/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update user preferences');
    }
  },

  async getUserProfile() {
    try {
      const response = await api.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  },

  // Portfolio and sharing
  async getPublicSkillTree(userId, careerName) {
    try {
      const response = await api.get(`/api/public/skill-tree/${userId}/${encodeURIComponent(careerName)}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get public skill tree');
    }
  },

  async updateSkillTreeVisibility(careerName, isPublic) {
    try {
      const response = await api.put('/api/user/skill-tree/visibility', {
        career_name: careerName,
        is_public: isPublic,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update skill tree visibility');
    }
  },

  // Analytics and insights
  async getProgressAnalytics() {
    try {
      const response = await api.get('/api/user/analytics');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get progress analytics');
    }
  },

  async getSkillRecommendations(careerName) {
    try {
      const response = await api.get(`/api/recommendations/${encodeURIComponent(careerName)}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get skill recommendations');
    }
  },
};

// Utility functions
export const isApiAvailable = async () => {
  try {
    await apiService.healthCheck();
    return true;
  } catch (error) {
    return false;
  }
};

export const getApiStatus = async () => {
  try {
    const health = await apiService.healthCheck();
    return {
      available: true,
      status: health.status,
      message: 'API is healthy',
    };
  } catch (error) {
    return {
      available: false,
      status: 'error',
      message: error.message,
    };
  }
};

// Export the axios instance for custom requests
export { api };
export { getApiStatus as checkApiStatus };
export default apiService;