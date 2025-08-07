/**
 * Professional logging system for Project Odysseus
 * Provides structured logging with performance monitoring
 */

class OdysseusLogger {
  constructor(module, options = {}) {
    this.module = module;
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.options = {
      enableConsole: process.env.NODE_ENV === 'development',
      enablePerformance: true,
      enableUserTracking: false,
      ...options
    };
    this.metrics = new Map();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createLogEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      module: this.module,
      level,
      message,
      data,
      performance: {
        sessionDuration: performance.now() - this.startTime,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  info(message, data = {}) {
    const entry = this.createLogEntry('INFO', message, data);
    if (this.options.enableConsole) {
      console.log(`[${this.module}] ${message}`, entry);
    }
    this.sendToAnalytics(entry);
  }

  warn(message, data = {}) {
    const entry = this.createLogEntry('WARN', message, data);
    if (this.options.enableConsole) {
      console.warn(`[${this.module}] ${message}`, entry);
    }
    this.sendToAnalytics(entry);
  }

  error(message, error = null, data = {}) {
    const entry = this.createLogEntry('ERROR', message, {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null
    });
    
    if (this.options.enableConsole) {
      console.error(`[${this.module}] ${message}`, entry);
    }
    this.sendToAnalytics(entry);
  }

  performance(operation, duration, metadata = {}) {
    const entry = this.createLogEntry('PERFORMANCE', `Operation: ${operation}`, {
      operation,
      duration,
      ...metadata
    });
    
    // Store performance metrics
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation).push(duration);
    
    if (this.options.enableConsole && this.options.enablePerformance) {
      console.log(`[${this.module}] Performance: ${operation} took ${duration}ms`, entry);
    }
    
    this.sendToAnalytics(entry);
  }

  getPerformanceStats(operation) {
    const measurements = this.metrics.get(operation);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: measurements.reduce((sum, val) => sum + val, 0) / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }

  sendToAnalytics(entry) {
    // In a real application, this would send to your analytics service
    // For now, we'll store in localStorage for development
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const logs = JSON.parse(localStorage.getItem('odysseus_logs') || '[]');
        logs.push(entry);
        
        // Keep only last 100 logs to prevent storage overflow
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('odysseus_logs', JSON.stringify(logs));
      } catch (error) {
        console.warn('Failed to store log entry:', error);
      }
    }
  }

  exportLogs() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return JSON.parse(localStorage.getItem('odysseus_logs') || '[]');
    }
    return [];
  }

  clearLogs() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('odysseus_logs');
    }
    this.metrics.clear();
  }
}

// Performance monitoring decorator
export const withPerformanceLogging = (logger, operationName) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const startTime = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - startTime;
        logger.performance(operationName || propertyKey, duration, {
          success: true,
          args: args.length
        });
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.performance(operationName || propertyKey, duration, {
          success: false,
          error: error.message,
          args: args.length
        });
        throw error;
      }
    };
    
    return descriptor;
  };
};

// Create module-specific loggers
export const createLogger = (module, options = {}) => {
  return new OdysseusLogger(module, options);
};

// Pre-configured loggers for common modules
export const apiLogger = createLogger('API', { enablePerformance: true });
export const uiLogger = createLogger('UI', { enableUserTracking: true });
export const skillTreeLogger = createLogger('SkillTree', { enablePerformance: true });
export const authLogger = createLogger('Auth', { enableUserTracking: false });

// Global error handler
if (typeof window !== 'undefined') {
  const globalLogger = createLogger('Global');
  
  window.addEventListener('error', (event) => {
    globalLogger.error('Uncaught error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    globalLogger.error('Unhandled promise rejection', event.reason, {
      type: 'unhandledrejection'
    });
  });
}

export default OdysseusLogger;