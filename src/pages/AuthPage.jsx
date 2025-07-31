import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  TreePine,
  Chrome,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import logoOdysseus from '../assets/logo-odysseus.png';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const careerParam = searchParams.get('career');
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    loading, 
    error 
  } = useAuth();
  
  const { 
    soundEnabled, 
    isAuthenticated,
    generateSkillTree 
  } = useAppStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (careerParam) {
        // Generate skill tree for the career and redirect
        generateSkillTree({ 
          career_name: careerParam,
          experience_level: 'intermediate',
          focus_areas: [],
          time_commitment: 'moderate'
        }).then(() => {
          navigate(`/skill-tree/${encodeURIComponent(careerParam)}`);
        }).catch(() => {
          navigate('/dashboard');
        });
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, careerParam, navigate, generateSkillTree]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.displayName) {
        errors.displayName = 'Name is required';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      if (soundEnabled) playClickSound();
      return;
    }
    
    if (soundEnabled) playClickSound();
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.displayName);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (soundEnabled) playClickSound();
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleAuthMode = () => {
    if (soundEnabled) playClickSound();
    setIsLogin(!isLogin);
    setFormErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-3 text-2xl font-bold text-primary mb-8 font-orbitron"
            onMouseEnter={() => soundEnabled && playHoverSound()}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-colors">
              <img 
                src={logoOdysseus} 
                alt="Project Odysseus Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span>Odysseus</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-light mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Guild'}
          </h2>
          
          <p className="text-light/70">
            {isLogin 
              ? 'Continue your learning journey' 
              : 'Start your path to mastery'
            }
          </p>
          
          {careerParam && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-primary">
                Ready to explore: <span className="font-semibold">{careerParam}</span>
              </p>
            </div>
          )}
        </div>

        {/* Auth Form */}
        <div className="glass-card p-8 border border-primary/20">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-light/80 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${
                      formErrors.displayName ? 'border-red-500/50' : ''
                    }`}
                    placeholder="Enter your full name"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light/50" />
                </div>
                {formErrors.displayName && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.displayName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${
                    formErrors.email ? 'border-red-500/50' : ''
                  }`}
                  placeholder="Enter your email"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light/50" />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${
                    formErrors.password ? 'border-red-500/50' : ''
                  }`}
                  placeholder="Enter your password"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light/50" />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    if (soundEnabled) playClickSound();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light/50 hover:text-light transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-light/80 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`input-field pl-10 pr-10 ${
                      formErrors.confirmPassword ? 'border-red-500/50' : ''
                    }`}
                    placeholder="Confirm your password"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light/50" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                      if (soundEnabled) playClickSound();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light/50 hover:text-light transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-light/30 border-t-light rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <Shield className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark text-light/60">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full btn-secondary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onMouseEnter={() => soundEnabled && playHoverSound()}
          >
            <Chrome className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-light/60">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleAuthMode}
                className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Forgot Password (Login Only) */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-light/60 hover:text-primary transition-colors"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="text-center space-y-4">
          <p className="text-light/60 text-sm">Join thousands of learners who have:</p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Mapped their skills</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-400">
              <CheckCircle className="w-4 h-4" />
              <span>Tracked progress</span>
            </div>
            <div className="flex items-center space-x-1 text-purple-400">
              <CheckCircle className="w-4 h-4" />
              <span>Built portfolios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;