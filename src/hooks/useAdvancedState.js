/**
 * Advanced State Management Hook
 * Professional React state management with validation, persistence, and optimization
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createLogger } from '../utils/logger';
import { validateUserInput } from '../utils/validators';
import { handleError, ValidationError } from '../utils/errorHandler';
import { trackEvent, trackPerformance } from '../utils/metrics';
import { CONFIG, FEATURE_FLAGS } from '../config/development';

const logger = createLogger('AdvancedState', { enablePerformance: true });

/**
 * Advanced state hook with validation, persistence, and optimization
 */
export const useAdvancedState = ({
  initialValue,
  key = null, // For localStorage persistence
  validator = null, // Validation function
  debounceMs = 0, // Debounce updates
  throttleMs = 0, // Throttle updates
  onStateChange = null, // Callback on state change
  enableMetrics = false, // Track state changes
  enableUndo = false, // Enable undo/redo functionality
  maxHistorySize = 10 // Max undo history size
}) => {
  const [state, setState] = useState(() => {
    // Try to load from localStorage if key is provided
    if (key && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`odysseus_state_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          logger.info('State loaded from localStorage', { key, hasValue: !!parsed });
          return parsed;
        }
      } catch (error) {
        logger.warn('Failed to load state from localStorage', error, { key });
      }
    }
    return initialValue;
  });
  
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [history, setHistory] = useState(enableUndo ? [initialValue] : []);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Refs for optimization
  const debounceRef = useRef(null);
  const throttleRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const validationRef = useRef(null);
  
  // Memoized validation function
  const validateState = useCallback(async (value) => {
    if (!validator) return { isValid: true, errors: [] };
    
    setIsValidating(true);
    const startTime = performance.now();
    
    try {
      let result;
      
      if (typeof validator === 'function') {
        result = await validator(value);
      } else if (typeof validator === 'object') {
        // Use built-in validators
        result = validateUserInput(value, validator);
      }
      
      const duration = performance.now() - startTime;
      
      if (enableMetrics) {
        trackPerformance('state_validation', duration, {
          key: key || 'anonymous',
          isValid: result.isValid,
          errorsCount: result.errors?.length || 0
        });
      }
      
      logger.performance('state_validation', duration, {
        key,
        isValid: result.isValid
      });
      
      return result;
    } catch (validationError) {
      const handledError = await handleError(validationError, {
        retryFunction: () => validateState(value),
        fallbackData: { isValid: false, errors: [validationError.message] }
      });
      
      return { isValid: false, errors: [handledError.message] };
    } finally {
      setIsValidating(false);
    }
  }, [validator, key, enableMetrics]);
  
  // Persist state to localStorage
  const persistState = useCallback((value) => {
    if (!key || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`odysseus_state_${key}`, JSON.stringify(value));
      logger.info('State persisted to localStorage', { key });
    } catch (error) {
      logger.error('Failed to persist state to localStorage', error, { key });
    }
  }, [key]);
  
  // Update history for undo functionality
  const updateHistory = useCallback((newValue) => {
    if (!enableUndo) return;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newValue);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [enableUndo, historyIndex, maxHistorySize]);
  
  // Advanced setState with validation and optimization
  const setAdvancedState = useCallback(async (newValue) => {
    const startTime = performance.now();
    
    try {
      // Handle function updates
      const resolvedValue = typeof newValue === 'function' ? newValue(state) : newValue;
      
      // Validate new value
      if (validator) {
        // Cancel previous validation
        if (validationRef.current) {
          validationRef.current.cancel?.();
        }
        
        const validation = await validateState(resolvedValue);
        
        if (!validation.isValid) {
          const validationError = new ValidationError(
            validation.errors?.[0] || 'Validation failed',
            key || 'state',
            validation
          );
          
          setError(validationError.message);
          
          if (enableMetrics) {
            trackEvent('state_validation_failed', {
              key: key || 'anonymous',
              errors: validation.errors
            });
          }
          
          return false; // Validation failed
        }
      }
      
      // Clear any previous errors
      setError(null);
      
      // Update state
      setState(resolvedValue);
      
      // Update history
      updateHistory(resolvedValue);
      
      // Persist state
      persistState(resolvedValue);
      
      // Call onChange callback
      if (onStateChange) {
        try {
          onStateChange(resolvedValue, state);
        } catch (callbackError) {
          logger.error('State change callback failed', callbackError, { key });
        }
      }
      
      // Track metrics
      if (enableMetrics) {
        const duration = performance.now() - startTime;
        trackEvent('state_updated', {
          key: key || 'anonymous',
          duration,
          hasValidator: !!validator,
          isPersisted: !!key
        });
        
        trackPerformance('state_update', duration, {
          key: key || 'anonymous',
          hasValidator: !!validator
        });
      }
      
      lastUpdateRef.current = Date.now();
      
      logger.info('State updated successfully', {
        key,
        duration: performance.now() - startTime,
        hasValidator: !!validator
      });
      
      return true; // Success
      
    } catch (error) {
      const handledError = await handleError(error, {
        retryFunction: () => setAdvancedState(newValue),
        fallbackData: null
      });
      
      setError(handledError.message);
      
      if (enableMetrics) {
        trackEvent('state_update_failed', {
          key: key || 'anonymous',
          error: handledError.message
        });
      }
      
      logger.error('State update failed', handledError, { key });
      
      return false; // Failed
    }
  }, [state, validator, validateState, updateHistory, persistState, onStateChange, enableMetrics, key]);
  
  // Debounced setState
  const setDebouncedState = useCallback((newValue) => {
    if (debounceMs <= 0) {
      return setAdvancedState(newValue);
    }
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setAdvancedState(newValue);
    }, debounceMs);
  }, [setAdvancedState, debounceMs]);
  
  // Throttled setState
  const setThrottledState = useCallback((newValue) => {
    if (throttleMs <= 0) {
      return setAdvancedState(newValue);
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    if (timeSinceLastUpdate >= throttleMs) {
      return setAdvancedState(newValue);
    }
    
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    throttleRef.current = setTimeout(() => {
      setAdvancedState(newValue);
    }, throttleMs - timeSinceLastUpdate);
  }, [setAdvancedState, throttleMs]);
  
  // Choose the appropriate setState function
  const finalSetState = useMemo(() => {
    if (debounceMs > 0) return setDebouncedState;
    if (throttleMs > 0) return setThrottledState;
    return setAdvancedState;
  }, [debounceMs, throttleMs, setDebouncedState, setThrottledState, setAdvancedState]);
  
  // Undo functionality
  const undo = useCallback(() => {
    if (!enableUndo || historyIndex <= 0) return false;
    
    const newIndex = historyIndex - 1;
    const previousValue = history[newIndex];
    
    setState(previousValue);
    setHistoryIndex(newIndex);
    persistState(previousValue);
    
    if (enableMetrics) {
      trackEvent('state_undo', {
        key: key || 'anonymous',
        newIndex,
        historyLength: history.length
      });
    }
    
    logger.info('State undo performed', { key, newIndex });
    
    return true;
  }, [enableUndo, historyIndex, history, persistState, enableMetrics, key]);
  
  // Redo functionality
  const redo = useCallback(() => {
    if (!enableUndo || historyIndex >= history.length - 1) return false;
    
    const newIndex = historyIndex + 1;
    const nextValue = history[newIndex];
    
    setState(nextValue);
    setHistoryIndex(newIndex);
    persistState(nextValue);
    
    if (enableMetrics) {
      trackEvent('state_redo', {
        key: key || 'anonymous',
        newIndex,
        historyLength: history.length
      });
    }
    
    logger.info('State redo performed', { key, newIndex });
    
    return true;
  }, [enableUndo, historyIndex, history, persistState, enableMetrics, key]);
  
  // Reset to initial value
  const reset = useCallback(() => {
    finalSetState(initialValue);
    
    if (enableUndo) {
      setHistory([initialValue]);
      setHistoryIndex(0);
    }
    
    if (enableMetrics) {
      trackEvent('state_reset', {
        key: key || 'anonymous'
      });
    }
    
    logger.info('State reset to initial value', { key });
  }, [finalSetState, initialValue, enableUndo, enableMetrics, key]);
  
  // Clear persisted state
  const clearPersisted = useCallback(() => {
    if (!key || typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(`odysseus_state_${key}`);
      logger.info('Persisted state cleared', { key });
    } catch (error) {
      logger.error('Failed to clear persisted state', error, { key });
    }
  }, [key]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      if (validationRef.current?.cancel) {
        validationRef.current.cancel();
      }
    };
  }, []);
  
  // Computed properties
  const canUndo = enableUndo && historyIndex > 0;
  const canRedo = enableUndo && historyIndex < history.length - 1;
  const hasError = !!error;
  const isValid = !hasError && !isValidating;
  
  return {
    // State
    value: state,
    error,
    isValidating,
    isValid,
    hasError,
    
    // Actions
    setValue: finalSetState,
    setValueImmediate: setAdvancedState,
    reset,
    
    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
    history: enableUndo ? history : [],
    historyIndex: enableUndo ? historyIndex : -1,
    
    // Persistence
    clearPersisted,
    
    // Utilities
    validate: () => validateState(state),
    
    // Metadata
    meta: {
      key,
      hasValidator: !!validator,
      isPersisted: !!key,
      isDebounced: debounceMs > 0,
      isThrottled: throttleMs > 0,
      enableUndo,
      enableMetrics
    }
  };
};

/**
 * Hook for managing form state with advanced features
 */
export const useAdvancedForm = ({
  initialValues = {},
  validationSchema = {},
  onSubmit = null,
  enablePersistence = false,
  persistenceKey = null
}) => {
  const formKey = persistenceKey || 'form';
  
  const {
    value: formData,
    setValue: setFormData,
    error: formError,
    isValidating,
    isValid,
    reset: resetForm,
    ...formMethods
  } = useAdvancedState({
    initialValue: initialValues,
    key: enablePersistence ? formKey : null,
    validator: async (data) => {
      const errors = {};
      let hasErrors = false;
      
      for (const [field, value] of Object.entries(data)) {
        const fieldSchema = validationSchema[field];
        if (fieldSchema) {
          const validation = validateUserInput(value, fieldSchema);
          if (!validation.isValid) {
            errors[field] = validation.errors;
            hasErrors = true;
          }
        }
      }
      
      return {
        isValid: !hasErrors,
        errors: hasErrors ? Object.keys(errors) : [],
        fieldErrors: errors
      };
    },
    enableMetrics: true,
    enableUndo: true
  });
  
  const setFieldValue = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);
  
  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    
    if (!isValid || !onSubmit) return false;
    
    try {
      const result = await onSubmit(formData);
      
      trackEvent('form_submitted', {
        formKey,
        fieldsCount: Object.keys(formData).length,
        success: true
      });
      
      return result;
    } catch (error) {
      const handledError = await handleError(error, {
        retryFunction: () => handleSubmit(),
        fallbackData: null
      });
      
      trackEvent('form_submit_failed', {
        formKey,
        error: handledError.message
      });
      
      throw handledError;
    }
  }, [isValid, onSubmit, formData, formKey]);
  
  return {
    formData,
    setFormData,
    setFieldValue,
    formError,
    isValidating,
    isValid,
    resetForm,
    handleSubmit,
    ...formMethods
  };
};

export default useAdvancedState;