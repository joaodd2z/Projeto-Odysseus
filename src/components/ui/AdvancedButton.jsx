/**
 * Advanced Button Component
 * Professional UI component with accessibility, animations, and advanced features
 */

import React, { forwardRef, useCallback, useRef, useImperativeHandle, useMemo } from 'react';
import { createLogger } from '../../utils/logger';
import { trackEvent, trackPerformance } from '../../utils/metrics';
import { handleError } from '../../utils/errorHandler';
import soundSystem from '../../utils/soundSystem';
import { FEATURE_FLAGS } from '../../config/development';

const logger = createLogger('AdvancedButton', { enablePerformance: true });

// Button variants and sizes
const VARIANTS = {
  primary: {
    base: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent',
    hover: 'hover:from-blue-700 hover:to-purple-700 hover:shadow-lg',
    active: 'active:from-blue-800 active:to-purple-800',
    disabled: 'disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed',
    focus: 'focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50'
  },
  secondary: {
    base: 'bg-white text-gray-700 border-gray-300',
    hover: 'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md',
    active: 'active:bg-gray-100',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    focus: 'focus:ring-4 focus:ring-gray-200 focus:ring-opacity-50'
  },
  danger: {
    base: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent',
    hover: 'hover:from-red-600 hover:to-red-700 hover:shadow-lg',
    active: 'active:from-red-700 active:to-red-800',
    disabled: 'disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed',
    focus: 'focus:ring-4 focus:ring-red-300 focus:ring-opacity-50'
  },
  ghost: {
    base: 'bg-transparent text-gray-600 border-transparent',
    hover: 'hover:bg-gray-100 hover:text-gray-800',
    active: 'active:bg-gray-200',
    disabled: 'disabled:text-gray-400 disabled:cursor-not-allowed',
    focus: 'focus:ring-4 focus:ring-gray-200 focus:ring-opacity-50'
  }
};

const SIZES = {
  xs: 'px-2 py-1 text-xs font-medium',
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-semibold'
};

const LOADING_SPINNER = (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Advanced Button Component with professional features
 */
export const AdvancedButton = forwardRef(({
  // Content
  children,
  leftIcon = null,
  rightIcon = null,
  
  // Appearance
  variant = 'primary',
  size = 'md',
  className = '',
  
  // States
  loading = false,
  disabled = false,
  
  // Behavior
  onClick = null,
  onMouseEnter = null,
  onMouseLeave = null,
  onFocus = null,
  onBlur = null,
  
  // Advanced features
  debounceMs = 0,
  throttleMs = 0,
  enableSound = true,
  enableMetrics = true,
  enableRipple = true,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  role = 'button',
  tabIndex = 0,
  
  // HTML attributes
  type = 'button',
  form = null,
  name = null,
  value = null,
  
  // Custom
  id = null,
  'data-testid': testId,
  
  ...rest
}, ref) => {
  const buttonRef = useRef(null);
  const debounceRef = useRef(null);
  const throttleRef = useRef(null);
  const lastClickRef = useRef(0);
  const rippleRef = useRef(null);
  
  // Expose ref methods
  useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current?.focus(),
    blur: () => buttonRef.current?.blur(),
    click: () => buttonRef.current?.click(),
    element: buttonRef.current
  }), []);
  
  // Memoized class names
  const buttonClasses = useMemo(() => {
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const sizeClasses = SIZES[size] || SIZES.md;
    
    const baseClasses = [
      // Base styles
      'relative inline-flex items-center justify-center',
      'border rounded-lg font-medium',
      'transition-all duration-200 ease-in-out',
      'transform-gpu will-change-transform',
      
      // Variant styles
      variantClasses.base,
      variantClasses.hover,
      variantClasses.active,
      variantClasses.disabled,
      variantClasses.focus,
      
      // Size styles
      sizeClasses,
      
      // State styles
      loading && 'cursor-wait',
      disabled && 'pointer-events-none',
      
      // Animation styles
      enableRipple && 'overflow-hidden',
      
      // Custom classes
      className
    ].filter(Boolean);
    
    return baseClasses.join(' ');
  }, [variant, size, className, loading, disabled, enableRipple]);
  
  // Create ripple effect
  const createRipple = useCallback((event) => {
    if (!enableRipple || !buttonRef.current) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    // Remove existing ripple
    const existingRipple = button.querySelector('.ripple-effect');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    // Create new ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect absolute rounded-full bg-white bg-opacity-30 pointer-events-none animate-ping';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }, [enableRipple]);
  
  // Handle click with debounce/throttle
  const handleClick = useCallback(async (event) => {
    if (loading || disabled || !onClick) return;
    
    const startTime = performance.now();
    
    try {
      // Create ripple effect
      createRipple(event);
      
      // Play sound
      if (enableSound && FEATURE_FLAGS.SOUND_EFFECTS) {
        soundSystem.playSound('click');
      }
      
      // Handle debounce
      if (debounceMs > 0) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        
        debounceRef.current = setTimeout(() => {
          onClick(event);
        }, debounceMs);
        
        return;
      }
      
      // Handle throttle
      if (throttleMs > 0) {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickRef.current;
        
        if (timeSinceLastClick < throttleMs) {
          return;
        }
        
        lastClickRef.current = now;
      }
      
      // Execute click handler
      await onClick(event);
      
      // Track metrics
      if (enableMetrics && FEATURE_FLAGS.METRICS) {
        const duration = performance.now() - startTime;
        
        trackEvent('button_clicked', {
          variant,
          size,
          hasLeftIcon: !!leftIcon,
          hasRightIcon: !!rightIcon,
          duration,
          debounceMs,
          throttleMs
        });
        
        trackPerformance('button_click_handler', duration, {
          variant,
          size
        });
      }
      
      logger.info('Button clicked successfully', {
        variant,
        size,
        duration: performance.now() - startTime
      });
      
    } catch (error) {
      const handledError = await handleError(error, {
        retryFunction: () => handleClick(event),
        fallbackData: null
      });
      
      if (enableMetrics) {
        trackEvent('button_click_failed', {
          variant,
          size,
          error: handledError.message
        });
      }
      
      logger.error('Button click failed', handledError, {
        variant,
        size
      });
    }
  }, [loading, disabled, onClick, createRipple, enableSound, debounceMs, throttleMs, enableMetrics, variant, size, leftIcon, rightIcon]);
  
  // Handle mouse enter with sound
  const handleMouseEnter = useCallback((event) => {
    if (enableSound && FEATURE_FLAGS.SOUND_EFFECTS && !disabled) {
      soundSystem.playSound('hover');
    }
    
    if (enableMetrics) {
      trackEvent('button_hover', {
        variant,
        size
      });
    }
    
    onMouseEnter?.(event);
  }, [enableSound, disabled, enableMetrics, variant, size, onMouseEnter]);
  
  // Handle focus
  const handleFocus = useCallback((event) => {
    if (enableMetrics) {
      trackEvent('button_focused', {
        variant,
        size
      });
    }
    
    logger.info('Button focused', { variant, size });
    
    onFocus?.(event);
  }, [enableMetrics, variant, size, onFocus]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);
  
  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <>
          {LOADING_SPINNER}
          <span className="ml-2">Loading...</span>
        </>
      );
    }
    
    return (
      <>
        {leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {children && (
          <span className="flex-1">
            {children}
          </span>
        )}
        
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </>
    );
  };
  
  return (
    <button
      ref={buttonRef}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={handleFocus}
      onBlur={onBlur}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      role={role}
      tabIndex={disabled ? -1 : tabIndex}
      form={form}
      name={name}
      value={value}
      id={id}
      data-testid={testId}
      data-variant={variant}
      data-size={size}
      data-loading={loading}
      {...rest}
    >
      {renderContent()}
    </button>
  );
});

AdvancedButton.displayName = 'AdvancedButton';

// Button group component
export const ButtonGroup = ({
  children,
  orientation = 'horizontal',
  spacing = 'sm',
  className = '',
  ...rest
}) => {
  const spacingClasses = {
    xs: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
    lg: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4'
  };
  
  const groupClasses = [
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    spacingClasses[spacing] || spacingClasses.sm,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      className={groupClasses}
      role="group"
      data-orientation={orientation}
      {...rest}
    >
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

export default AdvancedButton;