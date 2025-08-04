/**
 * Advanced Metrics and Analytics System
 * Professional performance monitoring and user behavior tracking
 */

import { createLogger } from './logger';
import { CONFIG, FEATURE_FLAGS } from '../config/development';

const logger = createLogger('Metrics', { enablePerformance: true });

/**
 * Core metrics collection class
 */
class MetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.isEnabled = FEATURE_FLAGS.ENABLE_ANALYTICS;
    
    if (this.isEnabled) {
      this.initializeMetrics();
    }
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  initializeMetrics() {
    // Initialize core metrics
    this.metrics.set('session', {
      id: this.sessionId,
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo(),
      performance: this.getPerformanceInfo()
    });
    
    // Set up periodic collection
    this.setupPeriodicCollection();
    
    // Set up event listeners
    this.setupEventListeners();
    
    logger.info('Metrics collection initialized', {
      sessionId: this.sessionId,
      enabled: this.isEnabled
    });
  }
  
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return null;
  }
  
  getPerformanceInfo() {
    if ('performance' in window) {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf?.domContentLoadedEventEnd - perf?.domContentLoadedEventStart,
        loadComplete: perf?.loadEventEnd - perf?.loadEventStart,
        firstPaint: this.getFirstPaint(),
        memoryUsage: this.getMemoryUsage()
      };
    }
    return null;
  }
  
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }
  
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  setupPeriodicCollection() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);
  }
  
  setupEventListeners() {
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('page_visibility_change', {
        hidden: document.hidden,
        timestamp: new Date().toISOString()
      });
    });
    
    // Window resize
    window.addEventListener('resize', this.debounce(() => {
      this.trackEvent('viewport_resize', {
        width: window.innerWidth,
        height: window.innerHeight,
        timestamp: new Date().toISOString()
      });
    }, 500));
    
    // Before unload
    window.addEventListener('beforeunload', () => {
      this.finalizeSession();
    });
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Track custom events
   */
  trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) return;
    
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer
      }
    };
    
    // Store event
    const events = this.metrics.get('events') || [];
    events.push(event);
    this.metrics.set('events', events);
    
    logger.info('Event tracked', {
      eventName,
      sessionId: this.sessionId,
      propertiesCount: Object.keys(properties).length
    });
    
    // Send to analytics if configured
    this.sendToAnalytics('event', event);
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(metricName, value, tags = {}) {
    if (!this.isEnabled) return;
    
    const metric = {
      name: metricName,
      value,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      tags
    };
    
    // Store metric
    const performance = this.metrics.get('performance') || [];
    performance.push(metric);
    this.metrics.set('performance', performance);
    
    // Check against performance budgets
    this.checkPerformanceBudget(metricName, value);
    
    logger.performance(metricName, value, tags);
  }
  
  checkPerformanceBudget(metricName, value) {
    const budget = CONFIG.PERFORMANCE_BUDGET[metricName.toUpperCase()];
    if (budget && value > budget) {
      logger.warn('Performance budget exceeded', {
        metric: metricName,
        value,
        budget,
        exceedBy: value - budget
      });
      
      this.trackEvent('performance_budget_exceeded', {
        metric: metricName,
        value,
        budget,
        exceedBy: value - budget
      });
    }
  }
  
  /**
   * Track user interactions
   */
  trackUserInteraction(action, element, properties = {}) {
    if (!this.isEnabled) return;
    
    this.trackEvent('user_interaction', {
      action,
      element: {
        tagName: element?.tagName,
        className: element?.className,
        id: element?.id,
        textContent: element?.textContent?.substring(0, 50)
      },
      ...properties
    });
  }
  
  /**
   * Track skill tree interactions
   */
  trackSkillTreeInteraction(action, skillData = {}) {
    this.trackEvent('skill_tree_interaction', {
      action,
      skillData: {
        objective: skillData.objective?.substring(0, 100),
        categoriesCount: skillData.categorias?.length,
        totalSkills: skillData.categorias?.reduce((sum, cat) => sum + (cat.habilidades?.length || 0), 0)
      }
    });
  }
  
  /**
   * Track API interactions
   */
  trackAPICall(endpoint, method, duration, status, error = null) {
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      status,
      success: status < 400,
      error: error ? {
        message: error.message,
        type: error.constructor.name
      } : null
    });
    
    this.trackPerformance('api_response_time', duration, {
      endpoint,
      method,
      status
    });
  }
  
  /**
   * Collect current performance metrics
   */
  collectPerformanceMetrics() {
    const now = performance.now();
    
    // Memory usage
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage) {
      this.trackPerformance('memory_usage', memoryUsage.used, {
        total: memoryUsage.total,
        percentage: (memoryUsage.used / memoryUsage.total) * 100
      });
    }
    
    // Session duration
    const sessionDuration = now - this.startTime;
    this.trackPerformance('session_duration', sessionDuration);
    
    // DOM nodes count
    const domNodesCount = document.querySelectorAll('*').length;
    this.trackPerformance('dom_nodes_count', domNodesCount);
    
    // Event listeners count (approximation)
    const eventListenersCount = this.estimateEventListeners();
    this.trackPerformance('event_listeners_count', eventListenersCount);
  }
  
  estimateEventListeners() {
    // This is an approximation - actual count would require more complex tracking
    return document.querySelectorAll('[onclick], [onchange], [onsubmit]').length;
  }
  
  /**
   * Send metrics to analytics service
   */
  sendToAnalytics(type, data) {
    if (!CONFIG.ENVIRONMENT.IS_PRODUCTION) {
      // In development, just log to console
      console.log(`[Analytics] ${type}:`, data);
      return;
    }
    
    // In production, send to actual analytics service
    // This would be replaced with actual analytics SDK calls
    try {
      // Example: Google Analytics, Mixpanel, etc.
      // gtag('event', data.name, data.properties);
      // mixpanel.track(data.name, data.properties);
    } catch (error) {
      logger.error('Failed to send analytics data', error, { type, data });
    }
  }
  
  /**
   * Get current metrics summary
   */
  getMetricsSummary() {
    const events = this.metrics.get('events') || [];
    const performance = this.metrics.get('performance') || [];
    
    return {
      sessionId: this.sessionId,
      sessionDuration: performance.now() - this.startTime,
      eventsCount: events.length,
      performanceMetricsCount: performance.length,
      topEvents: this.getTopEvents(events),
      averagePerformance: this.getAveragePerformance(performance)
    };
  }
  
  getTopEvents(events) {
    const eventCounts = events.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }
  
  getAveragePerformance(performance) {
    const metricAverages = performance.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = { sum: 0, count: 0 };
      }
      acc[metric.name].sum += metric.value;
      acc[metric.name].count += 1;
      return acc;
    }, {});
    
    return Object.entries(metricAverages).map(([name, data]) => ({
      name,
      average: data.sum / data.count
    }));
  }
  
  /**
   * Finalize session and send summary
   */
  finalizeSession() {
    const summary = this.getMetricsSummary();
    
    logger.info('Session finalized', summary);
    
    this.trackEvent('session_end', {
      duration: summary.sessionDuration,
      eventsCount: summary.eventsCount,
      performanceMetricsCount: summary.performanceMetricsCount
    });
    
    // Send final summary to analytics
    this.sendToAnalytics('session_summary', summary);
  }
  
  /**
   * Export metrics data
   */
  exportMetrics() {
    return {
      session: this.metrics.get('session'),
      events: this.metrics.get('events') || [],
      performance: this.metrics.get('performance') || [],
      summary: this.getMetricsSummary()
    };
  }
}

// Create global metrics instance
const metrics = new MetricsCollector();

// Export convenience functions
export const trackEvent = (eventName, properties) => metrics.trackEvent(eventName, properties);
export const trackPerformance = (metricName, value, tags) => metrics.trackPerformance(metricName, value, tags);
export const trackUserInteraction = (action, element, properties) => metrics.trackUserInteraction(action, element, properties);
export const trackSkillTreeInteraction = (action, skillData) => metrics.trackSkillTreeInteraction(action, skillData);
export const trackAPICall = (endpoint, method, duration, status, error) => metrics.trackAPICall(endpoint, method, duration, status, error);
export const getMetricsSummary = () => metrics.getMetricsSummary();
export const exportMetrics = () => metrics.exportMetrics();

// Development utilities
if (CONFIG.ENVIRONMENT.IS_DEVELOPMENT) {
  window.OdysseusMetrics = {
    metrics,
    trackEvent,
    trackPerformance,
    getMetricsSummary,
    exportMetrics
  };
}

export default metrics;