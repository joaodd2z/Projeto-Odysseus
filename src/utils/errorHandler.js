/**
 * Professional error handling system for Project Odysseus
 * Implements centralized error management with recovery strategies
 */

import { apiLogger } from './logger.js';
import soundSystem from '../utils/soundSystem.js';

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  API: 'api',
  UI: 'ui',
  SYSTEM: 'system',
  USER_INPUT: 'user_input'
};

// Custom error classes
export class OdysseusError extends Error {
  constructor(message, category = ErrorCategory.SYSTEM, severity = ErrorSeverity.MEDIUM, code = null, metadata = {}) {
    super(message);
    this.name = 'OdysseusError';
    this.category = category;
    this.severity = severity;
    this.code = code;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
    this.sessionId = this.generateSessionId();
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    this.url = typeof window !== 'undefined' ? window.location.href : 'unknown';
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      code: this.code,
      metadata: this.metadata,
      timestamp: this.timestamp,
      sessionId: this.sessionId,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack
    };
  }
}

export class NetworkError extends OdysseusError {
  constructor(message, statusCode = null, endpoint = null) {
    super(message, ErrorCategory.NETWORK, ErrorSeverity.HIGH, `NETWORK_${statusCode}`, {
      statusCode,
      endpoint,
      isRetryable: statusCode >= 500 || statusCode === 429
    });
  }
}

export class ValidationError extends OdysseusError {
  constructor(message, field = null, validationResult = null) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, 'VALIDATION_FAILED', {
      field,
      validationResult
    });
  }
}

export class AuthenticationError extends OdysseusError {
  constructor(message, authMethod = null) {
    super(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, 'AUTH_FAILED', {
      authMethod,
      requiresReauth: true
    });
  }
}

export class APIError extends OdysseusError {
  constructor(message, endpoint = null, requestData = null, responseData = null) {
    super(message, ErrorCategory.API, ErrorSeverity.MEDIUM, 'API_ERROR', {
      endpoint,
      requestData,
      responseData
    });
  }
}

// Error recovery strategies
class ErrorRecoveryStrategy {
  constructor(name, canRecover, recover) {
    this.name = name;
    this.canRecover = canRecover;
    this.recover = recover;
  }
}

const recoveryStrategies = [
  new ErrorRecoveryStrategy(
    'network_retry',
    (error) => error instanceof NetworkError && error.metadata.isRetryable,
    async (error, context) => {
      const maxRetries = 3;
      const baseDelay = 1000;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
          
          if (context.retryFunction) {
            return await context.retryFunction();
          }
          
          throw new Error('No retry function provided');
        } catch (retryError) {
          if (attempt === maxRetries) {
            throw retryError;
          }
          
          apiLogger.warn(`Retry attempt ${attempt} failed`, {
            originalError: error.message,
            retryError: retryError.message
          });
        }
      }
    }
  ),
  
  new ErrorRecoveryStrategy(
    'auth_refresh',
    (error) => error instanceof AuthenticationError,
    async (error, context) => {
      if (context.refreshAuth) {
        try {
          await context.refreshAuth();
          
          if (context.retryFunction) {
            return await context.retryFunction();
          }
        } catch (refreshError) {
          throw new AuthenticationError('Failed to refresh authentication', 'token_refresh');
        }
      }
      
      throw error;
    }
  ),
  
  new ErrorRecoveryStrategy(
    'fallback_data',
    (error) => error.category === ErrorCategory.API,
    async (error, context) => {
      if (context.fallbackData) {
        apiLogger.info('Using fallback data due to API error', {
          originalError: error.message,
          fallbackType: typeof context.fallbackData
        });
        
        return context.fallbackData;
      }
      
      throw error;
    }
  )
];

// Main error handler class
class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.isProcessing = false;
    this.errorCounts = new Map();
    this.rateLimitWindow = 60000; // 1 minute
    this.maxErrorsPerWindow = 10;
    this.globalErrorHandlers = [];
    
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(new OdysseusError(
          event.message,
          ErrorCategory.SYSTEM,
          ErrorSeverity.HIGH,
          'UNCAUGHT_ERROR',
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        ));
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new OdysseusError(
          event.reason?.message || 'Unhandled promise rejection',
          ErrorCategory.SYSTEM,
          ErrorSeverity.HIGH,
          'UNHANDLED_REJECTION',
          { reason: event.reason }
        ));
      });
    }
  }

  async handleError(error, context = {}) {
    try {
      // Rate limiting
      if (this.isRateLimited(error)) {
        return;
      }
      
      // Convert to OdysseusError if needed
      const odysseusError = error instanceof OdysseusError ? error : this.convertToOdysseusError(error);
      
      // Log the error
      this.logError(odysseusError);
      
      // Play error sound
      this.playErrorSound(odysseusError.severity);
      
      // Try recovery strategies
      const recoveryResult = await this.attemptRecovery(odysseusError, context);
      if (recoveryResult !== null) {
        return recoveryResult;
      }
      
      // Notify global handlers
      this.notifyGlobalHandlers(odysseusError, context);
      
      // Queue for batch processing if needed
      this.queueError(odysseusError);
      
      return odysseusError;
    } catch (handlingError) {
      console.error('Error in error handler:', handlingError);
      apiLogger.error('Error handler failed', handlingError);
    }
  }

  convertToOdysseusError(error) {
    if (error.name === 'TypeError') {
      return new OdysseusError(error.message, ErrorCategory.SYSTEM, ErrorSeverity.MEDIUM, 'TYPE_ERROR');
    }
    
    if (error.name === 'ReferenceError') {
      return new OdysseusError(error.message, ErrorCategory.SYSTEM, ErrorSeverity.HIGH, 'REFERENCE_ERROR');
    }
    
    if (error.message?.includes('fetch')) {
      return new NetworkError(error.message);
    }
    
    return new OdysseusError(
      error.message || 'Unknown error',
      ErrorCategory.SYSTEM,
      ErrorSeverity.MEDIUM,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  isRateLimited(error) {
    const now = Date.now();
    const errorKey = `${error.category}_${error.code}`;
    
    if (!this.errorCounts.has(errorKey)) {
      this.errorCounts.set(errorKey, []);
    }
    
    const errorTimes = this.errorCounts.get(errorKey);
    
    // Remove old entries
    const cutoff = now - this.rateLimitWindow;
    const recentErrors = errorTimes.filter(time => time > cutoff);
    
    if (recentErrors.length >= this.maxErrorsPerWindow) {
      apiLogger.warn('Error rate limit exceeded', {
        errorKey,
        count: recentErrors.length,
        window: this.rateLimitWindow
      });
      return true;
    }
    
    recentErrors.push(now);
    this.errorCounts.set(errorKey, recentErrors);
    
    return false;
  }

  logError(error) {
    const logLevel = this.getLogLevel(error.severity);
    
    switch (logLevel) {
      case 'error':
        apiLogger.error(error.message, error, error.metadata);
        break;
      case 'warn':
        apiLogger.warn(error.message, error.metadata);
        break;
      default:
        apiLogger.info(error.message, error.metadata);
    }
  }

  getLogLevel(severity) {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      default:
        return 'info';
    }
  }

  playErrorSound(severity) {
    if (typeof soundSystem !== 'undefined' && soundSystem.playSound) {
      switch (severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
          soundSystem.playSound('error');
          break;
        case ErrorSeverity.MEDIUM:
          soundSystem.playSound('warning');
          break;
        default:
          // No sound for low severity
          break;
      }
    }
  }

  async attemptRecovery(error, context) {
    for (const strategy of recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          apiLogger.info(`Attempting recovery with strategy: ${strategy.name}`, {
            error: error.message,
            strategy: strategy.name
          });
          
          const result = await strategy.recover(error, context);
          
          apiLogger.info(`Recovery successful with strategy: ${strategy.name}`);
          return result;
        } catch (recoveryError) {
          apiLogger.warn(`Recovery failed with strategy: ${strategy.name}`, {
            originalError: error.message,
            recoveryError: recoveryError.message
          });
        }
      }
    }
    
    return null;
  }

  notifyGlobalHandlers(error, context) {
    this.globalErrorHandlers.forEach(handler => {
      try {
        handler(error, context);
      } catch (handlerError) {
        console.error('Global error handler failed:', handlerError);
      }
    });
  }

  queueError(error) {
    this.errorQueue.push(error);
    
    if (!this.isProcessing) {
      this.processErrorQueue();
    }
  }

  async processErrorQueue() {
    this.isProcessing = true;
    
    try {
      while (this.errorQueue.length > 0) {
        const errors = this.errorQueue.splice(0, 10); // Process in batches
        
        // Send to analytics/monitoring service
        await this.sendErrorBatch(errors);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (processingError) {
      console.error('Error queue processing failed:', processingError);
    } finally {
      this.isProcessing = false;
    }
  }

  async sendErrorBatch(errors) {
    // In a real application, this would send to your error tracking service
    // For now, we'll store in localStorage for development
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const existingErrors = JSON.parse(localStorage.getItem('odysseus_errors') || '[]');
        const allErrors = [...existingErrors, ...errors.map(e => e.toJSON())];
        
        // Keep only last 50 errors
        if (allErrors.length > 50) {
          allErrors.splice(0, allErrors.length - 50);
        }
        
        localStorage.setItem('odysseus_errors', JSON.stringify(allErrors));
      } catch (storageError) {
        console.warn('Failed to store error batch:', storageError);
      }
    }
  }

  addGlobalHandler(handler) {
    this.globalErrorHandlers.push(handler);
  }

  removeGlobalHandler(handler) {
    const index = this.globalErrorHandlers.indexOf(handler);
    if (index > -1) {
      this.globalErrorHandlers.splice(index, 1);
    }
  }

  getErrorStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const stats = {
      totalErrors: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
      recentErrors: 0
    };
    
    this.errorCounts.forEach((times, key) => {
      const recentTimes = times.filter(time => now - time < oneHour);
      stats.totalErrors += times.length;
      stats.recentErrors += recentTimes.length;
      
      const [category, code] = key.split('_');
      stats.errorsByCategory[category] = (stats.errorsByCategory[category] || 0) + times.length;
    });
    
    return stats;
  }

  clearErrorHistory() {
    this.errorCounts.clear();
    this.errorQueue.length = 0;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('odysseus_errors');
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Utility functions
export const handleError = (error, context = {}) => errorHandler.handleError(error, context);
export const createError = (message, category, severity, code, metadata) => 
  new OdysseusError(message, category, severity, code, metadata);
export const addGlobalErrorHandler = (handler) => errorHandler.addGlobalHandler(handler);
export const removeGlobalErrorHandler = (handler) => errorHandler.removeGlobalHandler(handler);
export const getErrorStats = () => errorHandler.getErrorStats();
export const clearErrorHistory = () => errorHandler.clearErrorHistory();

// Decorator for automatic error handling
export const withErrorHandling = (category = ErrorCategory.SYSTEM, severity = ErrorSeverity.MEDIUM) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const odysseusError = error instanceof OdysseusError ? error : 
          new OdysseusError(error.message, category, severity, null, {
            method: propertyKey,
            args: args.length
          });
        
        throw await handleError(odysseusError);
      }
    };
    
    return descriptor;
  };
};

export default errorHandler;