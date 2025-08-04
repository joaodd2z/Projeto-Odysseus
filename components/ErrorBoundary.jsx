import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-gray-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent" />
          
          {/* Error Content */}
          <div className="relative z-10 max-w-2xl w-full">
            <div className="glass-card border-red-500/30 bg-red-500/5 p-8 text-center">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-light mb-4 font-orbitron">
                Oops! Something went wrong
              </h1>
              
              {/* Error Description */}
              <p className="text-light/80 mb-6 text-lg">
                We encountered an unexpected error. Don&apos;t worry, your progress is safe!
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-red-500/20 text-left">
                  <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
                  <pre className="text-xs text-light/70 overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <h4 className="text-red-400 font-semibold mt-3 mb-2">Component Stack:</h4>
                      <pre className="text-xs text-light/70 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Retry Count */}
              {this.state.retryCount > 0 && (
                <p className="text-light/60 text-sm mt-4">
                  Retry attempts: {this.state.retryCount}
                </p>
              )}

              {/* Help Text */}
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-primary font-semibold mb-2">Need Help?</h3>
                <p className="text-light/70 text-sm">
                  If this error persists, please try refreshing the page or contact support.
                  Your learning progress is automatically saved and won&apos;t be lost.
                </p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-red-400/30" />
            <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-red-400/30" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-red-400/30" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-red-400/30" />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;