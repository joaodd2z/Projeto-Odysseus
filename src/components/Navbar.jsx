import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import { Menu, X, User, LogOut, Settings, Shield, Zap } from 'lucide-react';
import logoOdysseus from '../assets/logo-odysseus.png';

const Navbar = ({ apiStatus }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { 
    isAuthenticated, 
    user, 
    sidebarOpen, 
    toggleSidebar, 
    soundEnabled,
    toggleSound 
  } = useAppStore();
  
  const { logout } = useAuth();

  // Detectar scroll para minimizar navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    if (soundEnabled) playClickSound();
    toggleSound();
  };

  const handleLogout = async () => {
    if (soundEnabled) playClickSound();
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/about', label: 'About', icon: '📖' },
  ];

  const authenticatedNavItems = [
    { path: '/skill-tree', label: 'Skill Trees', icon: '🌳' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 glass-card border-b border-primary/20 transition-all duration-300 ${
      isScrolled ? 'py-1' : 'py-0'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-12' : 'h-16'
        }`}>
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
            <button
              onClick={() => {
                if (soundEnabled) playClickSound();
                toggleSidebar();
              }}
              onMouseEnter={() => soundEnabled && playHoverSound()}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-light" />
              ) : (
                <Menu className="w-5 h-5 text-light" />
              )}
            </button>

            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300"
              onClick={() => soundEnabled && playClickSound()}
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <div className="relative">
                <div className={`rounded-lg overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 ${
                  isScrolled ? 'w-8 h-8' : 'w-10 h-10'
                }`}>
                  <img 
                    src={logoOdysseus} 
                    alt="Project Odysseus Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute -top-1 -right-1 bg-accent rounded-full animate-pulse transition-all duration-300 ${
                  isScrolled ? 'w-2 h-2' : 'w-3 h-3'
                }`} />
              </div>
            </Link>
          </div>

          {/* Center Section - Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-light/80 hover:text-light hover:bg-primary/10'
                  }`}
                  onClick={() => soundEnabled && playClickSound()}
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {isAuthenticated && authenticatedNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-light/80 hover:text-light hover:bg-primary/10'
                  }`}
                  onClick={() => soundEnabled && playClickSound()}
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* API Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-red-400'
              }`} />
              <span className="text-xs text-light/60">
                {apiStatus === 'connected' ? 'API Online' : 'API Offline'}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              onMouseEnter={() => soundEnabled && playHoverSound()}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'text-primary hover:bg-primary/10' 
                  : 'text-light/40 hover:bg-gray-700'
              }`}
              aria-label="Toggle sound"
            >
              {soundEnabled ? (
                <Zap className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4 opacity-50" />
              )}
            </button>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    if (soundEnabled) playClickSound();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-dark" />
                    </div>
                  )}
                  <span className="hidden sm:block text-light font-medium">
                    {user?.displayName || 'User'}
                  </span>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card border border-primary/20 rounded-lg shadow-xl">
                    <div className="p-3 border-b border-primary/20">
                      <p className="text-sm font-medium text-light">{user?.displayName}</p>
                      <p className="text-xs text-light/60">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-light hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          if (soundEnabled) playClickSound();
                          setUserMenuOpen(false);
                        }}
                        onMouseEnter={() => soundEnabled && playHoverSound()}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-light hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          if (soundEnabled) playClickSound();
                          setUserMenuOpen(false);
                        }}
                        onMouseEnter={() => soundEnabled && playHoverSound()}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        onMouseEnter={() => soundEnabled && playHoverSound()}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary"
                onClick={() => soundEnabled && playClickSound()}
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-primary/20">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-light/80 hover:text-light hover:bg-primary/10'
                }`}
                onClick={() => soundEnabled && playClickSound()}
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {isAuthenticated && authenticatedNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-light/80 hover:text-light hover:bg-primary/10'
                }`}
                onClick={() => soundEnabled && playClickSound()}
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;