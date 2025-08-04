import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationToast = () => {
  const { notification, setNotification } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setNotification(null);
      setIsVisible(false);
      setIsLeaving(false);
    }, 300);
  };

  if (!notification || !isVisible) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const getProgressBarColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full">
      <div 
        className={`glass-card border ${getColorClasses()} transform transition-all duration-300 ease-out ${
          isLeaving 
            ? 'translate-x-full opacity-0 scale-95' 
            : 'translate-x-0 opacity-100 scale-100'
        }`}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-t-lg overflow-hidden">
          <div 
            className={`h-full ${getProgressBarColor()} animate-progress-bar`}
            style={{
              animation: 'progress-bar 5s linear forwards'
            }}
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {notification.title && (
                <h4 className="text-sm font-semibold text-light mb-1">
                  {notification.title}
                </h4>
              )}
              <p className="text-sm text-light/80 leading-relaxed">
                {notification.message}
              </p>
              
              {/* Action Button */}
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action.onClick();
                    handleDismiss();
                  }}
                  className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-light/60 hover:text-light transition-colors p-1 rounded"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-lg blur-xl opacity-20 -z-10 ${
          notification.type === 'success' ? 'bg-green-400' :
          notification.type === 'error' ? 'bg-red-400' :
          notification.type === 'warning' ? 'bg-yellow-400' :
          'bg-blue-400'
        }`} />
      </div>
    </div>
  );
};

// Add custom CSS for progress bar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes progress-bar {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  
  .animate-progress-bar {
    animation: progress-bar 5s linear forwards;
  }
`;
document.head.appendChild(style);

export default NotificationToast;