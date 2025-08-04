import { useEffect, useState } from 'react';

const LoadingScreen = ({ message = 'Initializing Odysseus...' }) => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            
            {/* Spinning Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
            
            {/* Inner Glow */}
            <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse" />
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-primary" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-light mb-2 font-orbitron">
          Project <span className="text-primary glow-text">Odysseus</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-light/60 mb-8 text-lg">
          Forge Your Path to Mastery
        </p>

        {/* Loading Message */}
        <div className="mb-6">
          <p className="text-light/80 text-lg font-medium">
            {message}{dots}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="relative">
            {/* Background */}
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Glow Effect */}
            <div 
              className="absolute top-0 h-2 bg-primary/50 rounded-full blur-sm transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between mt-2 text-sm text-light/60">
            <span>Loading...</span>
            <span>{Math.round(Math.min(progress, 100))}%</span>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="glass-card p-4 border border-primary/20">
            <p className="text-sm text-light/70 italic">
              💡 <strong>Tip:</strong> Each skill you master unlocks new possibilities in your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
};

export default LoadingScreen;