/**
 * Development Configuration
 * Professional development settings and feature flags
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('DevConfig');

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';
const isTest = import.meta.env.MODE === 'test';

// Feature flags for development
export const FEATURE_FLAGS = {
  // Logging and debugging
  ENABLE_PERFORMANCE_LOGGING: isDevelopment,
  ENABLE_VERBOSE_LOGGING: isDevelopment,
  ENABLE_ERROR_BOUNDARY_LOGGING: true,
  ENABLE_REDUX_DEVTOOLS: isDevelopment,
  
  // UI/UX features
  ENABLE_SOUND_SYSTEM: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_TOOLTIPS: true,
  ENABLE_KEYBOARD_SHORTCUTS: isDevelopment,
  
  // API and networking
  ENABLE_API_MOCKING: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_REQUEST_CACHING: isProduction,
  ENABLE_AUTO_RETRY: true,
  
  // Security and validation
  ENABLE_STRICT_VALIDATION: true,
  ENABLE_CONTENT_SECURITY_POLICY: isProduction,
  ENABLE_INPUT_SANITIZATION: true,
  
  // Performance optimizations
  ENABLE_CODE_SPLITTING: isProduction,
  ENABLE_LAZY_LOADING: isProduction,
  ENABLE_SERVICE_WORKER: isProduction,
  
  // Experimental features
  ENABLE_BETA_FEATURES: isDevelopment,
  ENABLE_A_B_TESTING: false,
  ENABLE_ANALYTICS: isProduction
};

// Development tools configuration
export const DEV_CONFIG = {
  // Logging levels
  LOG_LEVEL: isDevelopment ? 'debug' : 'info',
  MAX_LOG_ENTRIES: isDevelopment ? 1000 : 100,
  LOG_RETENTION_DAYS: isDevelopment ? 7 : 1,
  
  // Performance monitoring
  PERFORMANCE_BUDGET: {
    INITIAL_LOAD: 3000, // 3 seconds
    ROUTE_CHANGE: 1000, // 1 second
    API_RESPONSE: 2000, // 2 seconds
    SKILL_TREE_GENERATION: 5000 // 5 seconds
  },
  
  // Error handling
  ERROR_REPORTING: {
    ENABLED: isProduction,
    SAMPLE_RATE: isProduction ? 0.1 : 1.0,
    MAX_BREADCRUMBS: 50,
    CAPTURE_CONSOLE: isDevelopment
  },
  
  // API configuration
  API_CONFIG: {
    TIMEOUT: isDevelopment ? 30000 : 15000,
    RETRY_ATTEMPTS: isDevelopment ? 5 : 3,
    RETRY_DELAY: 1000,
    CACHE_TTL: 300000 // 5 minutes
  },
  
  // UI configuration
  UI_CONFIG: {
    ANIMATION_DURATION: isDevelopment ? 100 : 300,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    TOAST_DURATION: 4000
  }
};

// Environment-specific overrides
const ENV_OVERRIDES = {
  development: {
    // Override any config for development
    API_CONFIG: {
      ...DEV_CONFIG.API_CONFIG,
      TIMEOUT: 60000 // Longer timeout for debugging
    }
  },
  production: {
    // Override any config for production
    LOG_LEVEL: 'warn',
    UI_CONFIG: {
      ...DEV_CONFIG.UI_CONFIG,
      ANIMATION_DURATION: 200 // Faster animations in production
    }
  },
  test: {
    // Override any config for testing
    LOG_LEVEL: 'error',
    API_CONFIG: {
      ...DEV_CONFIG.API_CONFIG,
      TIMEOUT: 5000 // Faster timeouts for tests
    }
  }
};

// Apply environment-specific overrides
const currentEnvOverrides = ENV_OVERRIDES[import.meta.env.MODE] || {};
export const CONFIG = {
  ...DEV_CONFIG,
  ...currentEnvOverrides,
  FEATURE_FLAGS,
  ENVIRONMENT: {
    MODE: import.meta.env.MODE,
    IS_DEVELOPMENT: isDevelopment,
    IS_PRODUCTION: isProduction,
    IS_TEST: isTest,
    BUILD_TIME: new Date().toISOString(),
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0'
  }
};

// Development utilities
export const DevUtils = {
  // Performance measurement
  measurePerformance: (name, fn) => {
    if (!FEATURE_FLAGS.ENABLE_PERFORMANCE_LOGGING) return fn();
    
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    logger.performance(name, duration);
    
    if (duration > DEV_CONFIG.PERFORMANCE_BUDGET[name.toUpperCase()]) {
      logger.warn(`Performance budget exceeded for ${name}`, {
        duration,
        budget: DEV_CONFIG.PERFORMANCE_BUDGET[name.toUpperCase()]
      });
    }
    
    return result;
  },
  
  // Feature flag checker
  isFeatureEnabled: (flagName) => {
    const enabled = FEATURE_FLAGS[flagName];
    if (enabled === undefined) {
      logger.warn(`Unknown feature flag: ${flagName}`);
      return false;
    }
    return enabled;
  },
  
  // Development mode checker
  isDev: () => isDevelopment,
  
  // Debug logger
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },
  
  // Configuration inspector
  inspectConfig: () => {
    if (isDevelopment) {
      console.group('🔧 Development Configuration');
      console.log('Environment:', import.meta.env.MODE);
      console.log('Feature Flags:', FEATURE_FLAGS);
      console.log('Config:', CONFIG);
      console.groupEnd();
    }
  }
};

// Initialize development tools
if (isDevelopment) {
  // Make DevUtils available globally for debugging
  window.DevUtils = DevUtils;
  
  // Log configuration on startup
  logger.info('Development configuration loaded', {
    mode: import.meta.env.MODE,
    featuresEnabled: Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key]).length,
    version: CONFIG.ENVIRONMENT.VERSION
  });
  
  // Performance budget warnings
  if (FEATURE_FLAGS.ENABLE_PERFORMANCE_LOGGING) {
    logger.info('Performance monitoring enabled', {
      budgets: DEV_CONFIG.PERFORMANCE_BUDGET
    });
  }
}

export default CONFIG;