import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import { 
  Search, 
  ArrowRight, 
  TreePine, 
  Target, 
  Award, 
  Users, 
  Zap, 
  Shield,
  ChevronDown,
  Play,
  Star
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { 
    isAuthenticated, 
    soundEnabled, 
    loadAvailableCareers, 
    availableCareers,
    generateSkillTree 
  } = useAppStore();

  useEffect(() => {
    loadAvailableCareers();
  }, [loadAvailableCareers]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (soundEnabled) playClickSound();
    
    try {
      if (isAuthenticated) {
        // Generate skill tree and navigate
        await generateSkillTree({ 
          career_name: searchQuery.trim(),
          experience_level: 'intermediate',
          focus_areas: [],
          time_commitment: 'moderate'
        });
        navigate(`/skill-tree/${encodeURIComponent(searchQuery.trim())}`);
      } else {
        // Redirect to auth with career parameter
        navigate(`/auth?career=${encodeURIComponent(searchQuery.trim())}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const popularCareers = [
    'Full-Stack Developer',
    'UX/UI Designer', 
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'Digital Marketing Specialist'
  ];

  const features = [
    {
      icon: TreePine,
      title: 'Dynamic Skill Trees',
      description: 'AI-generated learning paths tailored to your career goals',
      color: 'text-green-400'
    },
    {
      icon: Target,
      title: 'Goal-Oriented Learning',
      description: 'Clear progression with dependencies and milestones',
      color: 'text-blue-400'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Gamified experience with rewards and recognition',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: 'Portfolio Integration',
      description: 'Showcase your skills with proof of completion',
      color: 'text-purple-400'
    }
  ];

  const stats = [
    { label: 'Career Paths', value: '50+', icon: TreePine },
    { label: 'Skills Mapped', value: '1000+', icon: Target },
    { label: 'Learners', value: '10K+', icon: Users },
    { label: 'Success Rate', value: '95%', icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-light mb-6 font-orbitron">
              Forge Your Path to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent glow-text">
                Mastery
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-light/80 max-w-3xl mx-auto leading-relaxed">
              Transform any career goal into an interactive skill tree. 
              Learn, progress, and showcase your journey like never before.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className={`relative transition-all duration-300 ${
                isSearchFocused ? 'transform scale-105' : ''
              }`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Enter your dream career (e.g., 'Full-Stack Developer')..."
                  className="w-full px-6 py-4 pl-14 pr-32 text-lg bg-dark/50 border-2 border-primary/30 rounded-xl text-light placeholder-light/50 focus:border-primary focus:outline-none transition-all duration-300"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2 flex items-center space-x-2"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  onClick={() => soundEnabled && playClickSound()}
                >
                  <span>Start</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
            
            {/* Popular Searches */}
            <div className="mt-6">
              <p className="text-light/60 text-sm mb-3">Popular career paths:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularCareers.map((career) => (
                  <button
                    key={career}
                    onClick={() => {
                      setSearchQuery(career);
                      if (soundEnabled) playClickSound();
                    }}
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                    className="px-3 py-1 text-sm bg-primary/10 text-primary border border-primary/30 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    {career}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => soundEnabled && playClickSound()}
              >
                <Shield className="w-5 h-5" />
                <span>Get Started Free</span>
              </Link>
            )}
            
            <Link
              to="/about"
              className="btn-secondary text-lg px-8 py-3 flex items-center space-x-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
              onClick={() => soundEnabled && playClickSound()}
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-primary" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-primary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-colors">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-light mb-2">{stat.value}</div>
                  <div className="text-light/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-light mb-4 font-orbitron">
              Why Choose <span className="text-primary">Odysseus</span>?
            </h2>
            <p className="text-xl text-light/80 max-w-3xl mx-auto">
              Experience learning like never before with our innovative approach to skill development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:transform hover:scale-105"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-light mb-3">{feature.title}</h3>
                <p className="text-light/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-light mb-4 font-orbitron">
              How It <span className="text-accent">Works</span>
            </h2>
            <p className="text-xl text-light/80 max-w-3xl mx-auto">
              Three simple steps to transform your learning journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Define Your Goal',
                description: 'Tell us your dream career or skill you want to master.',
                icon: Target
              },
              {
                step: '02', 
                title: 'Get Your Tree',
                description: 'Receive a personalized skill tree with clear progression paths.',
                icon: TreePine
              },
              {
                step: '03',
                title: 'Start Learning',
                description: 'Follow the path, complete skills, and track your progress.',
                icon: Zap
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-accent transform translate-x-4 z-0" />
                )}
                
                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border-2 border-primary/30">
                    <item.icon className="w-12 h-12 text-primary" />
                  </div>
                  
                  <div className="text-6xl font-bold text-primary/30 mb-2 font-orbitron">
                    {item.step}
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-light mb-4">
                    {item.title}
                  </h3>
                  
                  <p className="text-light/70 max-w-sm mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 border border-primary/20">
            <h2 className="text-4xl font-bold text-light mb-6 font-orbitron">
              Ready to Begin Your <span className="text-primary">Odyssey</span>?
            </h2>
            
            <p className="text-xl text-light/80 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have transformed their careers with structured, 
              gamified skill development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <Link
                  to="/auth"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  onClick={() => soundEnabled && playClickSound()}
                >
                  <Shield className="w-5 h-5" />
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/skill-tree"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  onClick={() => soundEnabled && playClickSound()}
                >
                  <TreePine className="w-5 h-5" />
                  <span>Explore Skill Trees</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;