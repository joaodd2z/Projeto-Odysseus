import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import {
  TreePine,
  Target,
  Award,
  TrendingUp,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Zap,
  Users,
  ArrowRight,
  BarChart3,
  Trophy,
  Fire,
  CheckCircle2
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    soundEnabled,
    userProgress,
    currentCareer,
    skillTreeData,
    loadUserProgress,
    loadAvailableCareers,
    availableCareers,
    generateSkillTree
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadUserProgress();
    loadAvailableCareers();
  }, [loadUserProgress, loadAvailableCareers]);

  // Calculate user stats
  const userStats = React.useMemo(() => {
    if (!userProgress) return { totalSkills: 0, completedSkills: 0, streakDays: 0, level: 1 };
    
    const totalSkills = Object.keys(userProgress).length;
    const completedSkills = Object.values(userProgress).filter(skill => skill.completed).length;
    const completionRate = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;
    const level = Math.floor(completedSkills / 10) + 1;
    
    return {
      totalSkills,
      completedSkills,
      completionRate: Math.round(completionRate),
      streakDays: 7, // Mock data - would come from backend
      level
    };
  }, [userProgress]);

  // Recent activity mock data
  const recentActivity = [
    {
      type: 'skill_completed',
      title: 'React Hooks',
      career: 'Full-Stack Developer',
      timestamp: '2 hours ago',
      icon: CheckCircle2,
      color: 'text-green-400'
    },
    {
      type: 'skill_started',
      title: 'TypeScript Basics',
      career: 'Full-Stack Developer',
      timestamp: '1 day ago',
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      type: 'career_started',
      title: 'UX/UI Designer',
      career: 'New Career Path',
      timestamp: '3 days ago',
      icon: TreePine,
      color: 'text-purple-400'
    }
  ];

  // Recommended careers
  const recommendedCareers = [
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'Mobile Developer'
  ];

  const handleCreateSkillTree = async (careerName) => {
    if (soundEnabled) playClickSound();
    
    try {
      await generateSkillTree({
        career_name: careerName,
        experience_level: 'intermediate',
        focus_areas: [],
        time_commitment: 'moderate'
      });
      navigate(`/skill-tree/${encodeURIComponent(careerName)}`);
    } catch (error) {
      console.error('Error creating skill tree:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleCreateSkillTree(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-light mb-2 font-orbitron">
                Welcome back, <span className="text-primary">{user?.displayName || 'Adventurer'}</span>
              </h1>
              <p className="text-light/70">
                Continue your journey to mastery. Your next skill awaits.
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  if (soundEnabled) playClickSound();
                }}
                className="btn-primary flex items-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                <Plus className="w-5 h-5" />
                <span>New Skill Tree</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-light/60 text-sm">Level</p>
                <p className="text-2xl font-bold text-light">{userStats.level}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-dark/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(userStats.completedSkills % 10) * 10}%` }}
                />
              </div>
              <p className="text-xs text-light/50 mt-1">
                {userStats.completedSkills % 10}/10 to next level
              </p>
            </div>
          </div>

          <div className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-light/60 text-sm">Skills Completed</p>
                <p className="text-2xl font-bold text-light">{userStats.completedSkills}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-xs text-light/50 mt-2">
              {userStats.completionRate}% completion rate
            </p>
          </div>

          <div className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-light/60 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-light">{userStats.streakDays}</p>
              </div>
              <Fire className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-xs text-light/50 mt-2">Days in a row</p>
          </div>

          <div className="glass-card p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-light/60 text-sm">Active Trees</p>
                <p className="text-2xl font-bold text-light">{currentCareer ? 1 : 0}</p>
              </div>
              <TreePine className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-light/50 mt-2">
              {currentCareer ? 'In progress' : 'Start your first tree'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Skill Tree */}
            {currentCareer && skillTreeData ? (
              <div className="glass-card p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-light flex items-center space-x-2">
                    <TreePine className="w-5 h-5 text-primary" />
                    <span>Current Path: {currentCareer}</span>
                  </h2>
                  <Link
                    to={`/skill-tree/${encodeURIComponent(currentCareer)}`}
                    className="btn-secondary text-sm flex items-center space-x-1"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                    onClick={() => soundEnabled && playClickSound()}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-dark/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-light/70">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-light mb-2">
                      {userStats.completionRate}%
                    </div>
                    <div className="w-full bg-dark/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${userStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-dark/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-light/70">Skills Unlocked</span>
                    </div>
                    <div className="text-2xl font-bold text-light">
                      {userStats.completedSkills}/{userStats.totalSkills}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No Active Tree */
              <div className="glass-card p-8 border border-primary/20 text-center">
                <TreePine className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-light mb-2">
                  Start Your First Skill Tree
                </h2>
                <p className="text-light/70 mb-6">
                  Choose a career path and begin your journey to mastery.
                </p>
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    if (soundEnabled) playClickSound();
                  }}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Skill Tree</span>
                </button>
              </div>
            )}

            {/* Quick Search */}
            <div className="glass-card p-6 border border-primary/20">
              <h2 className="text-xl font-semibold text-light mb-4 flex items-center space-x-2">
                <Search className="w-5 h-5 text-primary" />
                <span>Explore New Paths</span>
              </h2>
              
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for any career or skill..."
                    className="w-full input-field pl-10 pr-20"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light/50" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-1 text-sm"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    Go
                  </button>
                </div>
              </form>
              
              <div className="space-y-2">
                <p className="text-sm text-light/60">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedCareers.map((career) => (
                    <button
                      key={career}
                      onClick={() => handleCreateSkillTree(career)}
                      onMouseEnter={() => soundEnabled && playHoverSound()}
                      className="px-3 py-1 text-sm bg-primary/10 text-primary border border-primary/30 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {career}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="glass-card p-6 border border-primary/20">
              <h3 className="text-lg font-semibold text-light mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Recent Activity</span>
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-dark/50 ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-light truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-light/60">
                        {activity.career}
                      </p>
                      <p className="text-xs text-light/40">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link
                to="/activity"
                className="block mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                View all activity →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6 border border-primary/20">
              <h3 className="text-lg font-semibold text-light mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>This Week</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light/70">Skills completed</span>
                  <span className="text-sm font-medium text-light">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light/70">Time spent</span>
                  <span className="text-sm font-medium text-light">12h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light/70">Streak</span>
                  <span className="text-sm font-medium text-light">{userStats.streakDays} days</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-card p-6 border border-primary/20">
              <h3 className="text-lg font-semibold text-light mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Recent Achievements</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-light">First Steps</p>
                    <p className="text-xs text-light/60">Completed your first skill</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-blue-400/10 rounded-lg border border-blue-400/20">
                  <Star className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-light">Quick Learner</p>
                    <p className="text-xs text-light/60">Completed 5 skills in a week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Skill Tree Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full p-6 border border-primary/20">
            <h3 className="text-xl font-semibold text-light mb-4">Create New Skill Tree</h3>
            
            <form onSubmit={handleSearchSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-light/80 mb-2">
                  Career or Skill Goal
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Full-Stack Developer, Data Science, UX Design"
                  className="w-full input-field"
                  autoFocus
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  Create Tree
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSearchQuery('');
                    if (soundEnabled) playClickSound();
                  }}
                  className="flex-1 btn-secondary"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;