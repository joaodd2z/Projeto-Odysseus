import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import { 
  Home, 
  TreePine, 
  User, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award,
  Settings,
  HelpCircle,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { 
    sidebarOpen, 
    isAuthenticated, 
    soundEnabled,
    currentCareer,
    getProgressStats 
  } = useAppStore();
  
  const progressStats = getProgressStats();

  const publicNavItems = [
    { path: '/', label: 'Home', icon: Home, description: 'Welcome to Odysseus' },
    { path: '/about', label: 'About', icon: BookOpen, description: 'Learn about our mission' },
  ];

  const authenticatedNavItems = [
    { path: '/skill-tree', label: 'Skill Trees', icon: TreePine, description: 'Explore career paths' },
    { path: '/profile', label: 'Profile', icon: User, description: 'Your learning journey' },
    { path: '/achievements', label: 'Achievements', icon: Award, description: 'Your accomplishments' },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp, description: 'Track your progress' },
  ];

  const utilityItems = [
    { path: '/settings', label: 'Settings', icon: Settings, description: 'Customize your experience' },
    { path: '/help', label: 'Help', icon: HelpCircle, description: 'Get support' },
  ];

  const NavItem = ({ item, isActive }) => (
    <Link
      to={item.path}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-primary/20 text-primary border-r-2 border-primary'
          : 'text-light/80 hover:text-light hover:bg-primary/10'
      }`}
      onClick={() => soundEnabled && playClickSound()}
      onMouseEnter={() => soundEnabled && playHoverSound()}
    >
      <item.icon className={`w-5 h-5 transition-colors ${
        isActive ? 'text-primary' : 'text-light/60 group-hover:text-light'
      }`} />
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${
          isActive ? 'text-primary' : 'text-light/80 group-hover:text-light'
        }`}>
          {item.label}
        </p>
        <p className="text-xs text-light/50 truncate group-hover:text-light/70">
          {item.description}
        </p>
      </div>
      {isActive && (
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </Link>
  );

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-30 lg:hidden"
        onClick={() => useAppStore.getState().toggleSidebar()}
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-dark/95 backdrop-blur-md border-r border-primary/20 z-40 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Current Career Status */}
          {isAuthenticated && currentCareer && (
            <div className="glass-card p-4 border border-primary/20">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-light text-sm">Current Path</h3>
              </div>
              
              <p className="text-light/80 text-sm mb-3 font-medium">
                {currentCareer}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-light/60">
                  <span>Progress</span>
                  <span>{progressStats.completed}/{progressStats.total}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${progressStats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-light/60">
                  {Math.round(progressStats.percentage)}% Complete
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {isAuthenticated && (
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3 text-center border border-primary/10">
                <div className="text-lg font-bold text-primary">
                  {progressStats.completed}
                </div>
                <div className="text-xs text-light/60">Skills Mastered</div>
              </div>
              <div className="glass-card p-3 text-center border border-accent/10">
                <div className="text-lg font-bold text-accent">
                  {progressStats.remaining}
                </div>
                <div className="text-xs text-light/60">Skills Remaining</div>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-light/40 uppercase tracking-wider mb-3 px-4">
                Navigation
              </h3>
              <div className="space-y-1">
                {publicNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return <NavItem key={item.path} item={item} isActive={isActive} />;
                })}
              </div>
            </div>

            {/* Authenticated Navigation */}
            {isAuthenticated && (
              <div>
                <h3 className="text-xs font-semibold text-light/40 uppercase tracking-wider mb-3 px-4">
                  Learning Hub
                </h3>
                <div className="space-y-1">
                  {authenticatedNavItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return <NavItem key={item.path} item={item} isActive={isActive} />;
                  })}
                </div>
              </div>
            )}

            {/* Utility Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-light/40 uppercase tracking-wider mb-3 px-4">
                Utilities
              </h3>
              <div className="space-y-1">
                {utilityItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return <NavItem key={item.path} item={item} isActive={isActive} />;
                })}
              </div>
            </div>
          </nav>

          {/* Sound Toggle */}
          <div className="pt-4 border-t border-primary/20">
            <button
              onClick={() => {
                if (soundEnabled) playClickSound();
                useAppStore.getState().toggleSound();
              }}
              onMouseEnter={() => soundEnabled && playHoverSound()}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                soundEnabled
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-light/60 hover:text-light hover:bg-gray-800'
              }`}
            >
              <Zap className={`w-5 h-5 ${
                soundEnabled ? 'text-primary' : 'text-light/40'
              }`} />
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">
                  Sound Effects
                </p>
                <p className="text-xs text-light/50">
                  {soundEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                soundEnabled ? 'bg-primary animate-pulse' : 'bg-gray-600'
              }`} />
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-primary/20">
            <div className="text-center">
              <p className="text-xs text-light/40 mb-2">
                Project Odysseus v1.0
              </p>
              <p className="text-xs text-light/30">
                Forge Your Path to Mastery
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;