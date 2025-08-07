/**
 * Performance monitoring hook for React components
 * Provides real-time performance metrics and optimization suggestions
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createLogger } from '../utils/logger.js';
import { trackPerformance, trackEvent } from '../utils/metrics.js';

const logger = createLogger('PerformanceMonitor');

/**
 * Hook for monitoring component performance
 * @param {string} componentName - Name of the component being monitored
 * @param {Object} options - Configuration options
 * @returns {Object} - Performance metrics and utilities
 */
export const usePerformanceMonitor = (componentName, options = {}) => {
  const {
    enableLogging = true,
    enableMetrics = true,
    thresholds = {
      renderTime: 16, // 60fps = 16.67ms per frame
      memoryUsage: 50 * 1024 * 1024, // 50MB
      rerenderCount: 10
    }
  } = options;

  const [metrics, setMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    memoryUsage: 0,
    isOptimal: true,
    warnings: []
  });

  const renderStartTime = useRef(null);
  const renderTimes = useRef([]);
  const mountTime = useRef(Date.now());
  const lastRenderCount = useRef(0);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End performance measurement
  const endMeasurement = useCallback(() => {
    if (renderStartTime.current === null) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderTimes.current.push(renderTime);

    // Keep only last 10 render times for average calculation
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    const renderCount = renderTimes.current.length;

    // Get memory usage if available
    let memoryUsage = 0;
    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize;
    }

    // Check for performance issues
    const warnings = [];
    let isOptimal = true;

    if (renderTime > thresholds.renderTime) {
      warnings.push(`Slow render detected: ${renderTime.toFixed(2)}ms`);
      isOptimal = false;
    }

    if (memoryUsage > thresholds.memoryUsage) {
      warnings.push(`High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      isOptimal = false;
    }

    if (renderCount > thresholds.rerenderCount) {
      warnings.push(`Excessive re-renders: ${renderCount}`);
      isOptimal = false;
    }

    const newMetrics = {
      renderCount,
      averageRenderTime,
      lastRenderTime: renderTime,
      memoryUsage,
      isOptimal,
      warnings
    };

    setMetrics(newMetrics);

    // Log performance data
    if (enableLogging && !isOptimal) {
      logger.warn(`Performance issue in ${componentName}`, {
        renderTime,
        averageRenderTime,
        memoryUsage: memoryUsage / 1024 / 1024,
        warnings
      });
    }

    // Send metrics to collector
    if (enableMetrics) {
      trackPerformance(componentName, {
        renderTime,
        averageRenderTime,
        memoryUsage,
        isOptimal
      });
    }

    renderStartTime.current = null;
  }, [componentName, enableLogging, enableMetrics, thresholds]);

  // Monitor component lifecycle
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement();
    };
  });

  // Track mount time
  useEffect(() => {
    const componentMountTime = Date.now() - mountTime.current;
    
    if (enableLogging) {
      logger.info(`${componentName} mounted`, {
        mountTime: componentMountTime
      });
    }

    if (enableMetrics) {
      trackEvent('component_mount', {
        component: componentName,
        mountTime: componentMountTime
      });
    }

    return () => {
      const componentLifetime = Date.now() - mountTime.current;
      
      if (enableLogging) {
        logger.info(`${componentName} unmounted`, {
          lifetime: componentLifetime,
          totalRenders: renderTimes.current.length
        });
      }

      if (enableMetrics) {
        trackEvent('component_unmount', {
          component: componentName,
          lifetime: componentLifetime,
          totalRenders: renderTimes.current.length
        });
      }
    };
  }, [componentName, enableLogging, enableMetrics]);

  // Utility functions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions = [];

    if (metrics.averageRenderTime > thresholds.renderTime) {
      suggestions.push('Consider using React.memo() to prevent unnecessary re-renders');
      suggestions.push('Check for expensive calculations that could be memoized with useMemo()');
      suggestions.push('Verify that event handlers are properly memoized with useCallback()');
    }

    if (metrics.renderCount > thresholds.rerenderCount) {
      suggestions.push('Reduce the number of state updates');
      suggestions.push('Consider splitting component into smaller components');
      suggestions.push('Check for unnecessary prop changes from parent components');
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      suggestions.push('Check for memory leaks in event listeners or timers');
      suggestions.push('Consider lazy loading for large data sets');
      suggestions.push('Optimize image and asset loading');
    }

    return suggestions;
  }, [metrics, thresholds]);

  const resetMetrics = useCallback(() => {
    renderTimes.current = [];
    setMetrics({
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      memoryUsage: 0,
      isOptimal: true,
      warnings: []
    });
  }, []);

  const forceUpdate = useCallback(() => {
    setMetrics(prev => ({ ...prev, renderCount: prev.renderCount + 1 }));
  }, []);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    getOptimizationSuggestions,
    resetMetrics,
    forceUpdate,
    isMonitoring: renderStartTime.current !== null
  };
};

/**
 * Higher-order component for automatic performance monitoring
 * @param {React.Component} WrappedComponent - Component to monitor
 * @param {Object} options - Monitoring options
 * @returns {React.Component} - Wrapped component with performance monitoring
 */
export const withPerformanceMonitor = (WrappedComponent, options = {}) => {
  const MonitoredComponent = (props) => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    const { metrics, startMeasurement, endMeasurement } = usePerformanceMonitor(componentName, options);

    useEffect(() => {
      startMeasurement();
      return endMeasurement;
    });

    return <WrappedComponent {...props} performanceMetrics={metrics} />;
  };

  MonitoredComponent.displayName = `withPerformanceMonitor(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return MonitoredComponent;
};

export default usePerformanceMonitor;