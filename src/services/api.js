import axios from 'axios';
import { auth } from './firebase';
import { playErrorSound, playSuccessSound } from '../utils/soundSystem';
import { createLogger } from '../utils/logger';
import { handleError, NetworkError, APIError } from '../utils/errorHandler';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const logger = createLogger('API', { enablePerformance: true });

// Enhanced API configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Platform': 'web'
  },
});

// Enhanced request interceptor with logging and performance tracking
api.interceptors.request.use(
  async (config) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.metadata = { 
      startTime: performance.now(),
      requestId,
      retryCount: config.retryCount || 0
    };
    
    try {
      const user = auth.currentUser;
      if (user) {
        const tokenStartTime = performance.now();
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        
        logger.performance('firebase_token_fetch', performance.now() - tokenStartTime, {
          requestId,
          hasToken: !!token
        });
      }
      
      logger.info('API request initiated', {
        requestId,
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!config.headers.Authorization,
        retryCount: config.retryCount || 0
      });
      
    } catch (error) {
      logger.error('Failed to get authentication token', error, {
        requestId,
        url: config.url
      });
      
      // Don't fail the request if token fetch fails for public endpoints
      if (!config.url?.includes('/public/')) {
        throw new APIError('Authentication token unavailable', 'auth', config, null);
      }
    }
    
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with comprehensive error handling and logging
api.interceptors.response.use(
  (response) => {
    const { metadata } = response.config;
    const duration = metadata ? performance.now() - metadata.startTime : 0;
    
    logger.performance('api_request_success', duration, {
      requestId: metadata?.requestId,
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      responseSize: JSON.stringify(response.data).length,
      retryCount: metadata?.retryCount || 0
    });
    
    logger.info('API request successful', {
      requestId: metadata?.requestId,
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: Math.round(duration)
    });
    
    // Play success sound for important operations
    if (response.config.method !== 'get' && response.status < 300) {
      playSuccessSound();
    }
    
    return response;
  },
  async (error) => {
    const { metadata } = error.config || {};
    const duration = metadata ? performance.now() - metadata.startTime : 0;
    
    // Create structured error object
    let structuredError;
    
    if (error.response) {
      // Server responded with error status
      structuredError = new APIError(
        error.response.data?.message || `HTTP ${error.response.status} Error`,
        'server',
        error.config,
        error.response
      );
    } else if (error.request) {
      // Network error
      structuredError = new NetworkError(
        'Network request failed',
        error.code || 'NETWORK_ERROR',
        error.config
      );
    } else {
      // Request setup error
      structuredError = new APIError(
        error.message || 'Request configuration error',
        'client',
        error.config,
        null
      );
    }
    
    logger.error('API request failed', structuredError, {
      requestId: metadata?.requestId,
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      duration: Math.round(duration),
      retryCount: metadata?.retryCount || 0,
      errorCode: error.code,
      errorType: structuredError.constructor.name
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      logger.warn('Authentication token expired or invalid', {
        requestId: metadata?.requestId,
        url: error.config?.url
      });
      
      // Try to refresh token and retry request
      try {
        const user = auth.currentUser;
        if (user && (!error.config.retryCount || error.config.retryCount < 2)) {
          logger.info('Attempting token refresh and request retry', {
            requestId: metadata?.requestId,
            retryCount: (error.config.retryCount || 0) + 1
          });
          
          await user.getIdToken(true); // Force refresh
          error.config.retryCount = (error.config.retryCount || 0) + 1;
          return api.request(error.config);
        }
      } catch (refreshError) {
        logger.error('Token refresh failed', refreshError, {
          requestId: metadata?.requestId
        });
      }
    }
    
    // Handle network errors with retry logic
    if (structuredError instanceof NetworkError && (!error.config.retryCount || error.config.retryCount < 3)) {
      const retryDelay = Math.min(1000 * Math.pow(2, error.config.retryCount || 0), 5000);
      
      logger.info('Retrying network request', {
        requestId: metadata?.requestId,
        retryCount: (error.config.retryCount || 0) + 1,
        retryDelay
      });
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      error.config.retryCount = (error.config.retryCount || 0) + 1;
      return api.request(error.config);
    }
    
    // Use global error handler
    const handledError = await handleError(structuredError, {
      retryFunction: null, // Already handled retries above
      fallbackData: null
    });
    
    playErrorSound();
    
    return Promise.reject(handledError);
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