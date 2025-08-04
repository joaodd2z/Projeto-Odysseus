import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound, playSkillCompleteSound } from '../utils/soundSystem';
import AIGenerator from '../components/AIGenerator';
import {
  TreePine,
  Target,
  Lock,
  CheckCircle2,
  Clock,
  BookOpen,
  ExternalLink,
  ArrowLeft,
  Share2,
  Download,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';

const SkillTreePage = () => {
  const { careerName } = useParams();
  const navigate = useNavigate();

  
  const {
    soundEnabled,
    skillTreeData,
    userProgress,
    selectedSkill,
    setSelectedSkill,
    loadSkillTree,
    generateSkillTree,
    completeSkill,
    uncompleteSkill,
    loadUserProgress
  } = useAppStore();

  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'
  const [filterLevel, setFilterLevel] = useState('all'); // 'all' | 'beginner' | 'intermediate' | 'advanced'
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load skill tree data
  useEffect(() => {
    const loadData = async () => {
      if (!careerName) return;
      
      setIsLoading(true);
      try {
        // Try to load existing skill tree first
        await loadSkillTree(careerName);
        
        // If no data, generate new tree
        if (!skillTreeData) {
          await generateSkillTree({
            career_name: careerName,
            experience_level: 'intermediate',
            focus_areas: [],
            time_commitment: 'moderate'
          });
        }
        
        await loadUserProgress();
      } catch (error) {
        console.error('Error loading skill tree:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [careerName, loadSkillTree, generateSkillTree, loadUserProgress, skillTreeData]);

  // Calculate tree statistics
  const treeStats = React.useMemo(() => {
    if (!skillTreeData?.skills || !userProgress) {
      return { total: 0, completed: 0, available: 0, locked: 0 };
    }

    const skills = skillTreeData.skills;
    const total = skills.length;
    const completed = skills.filter(skill => userProgress[skill.id]?.completed).length;
    const available = skills.filter(skill => {
      const progress = userProgress[skill.id];
      if (progress?.completed) return false;
      
      // Check if all prerequisites are completed
      if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
      return skill.prerequisites.every(prereqId => userProgress[prereqId]?.completed);
    }).length;
    const locked = total - completed - available;

    return { total, completed, available, locked };
  }, [skillTreeData, userProgress]);

  // Handle skill click
  const handleSkillClick = useCallback((skill) => {
    if (soundEnabled) playClickSound();
    setSelectedSkill(skill);
    setShowSkillModal(true);
  }, [soundEnabled, setSelectedSkill]);

  // Handle skill completion toggle
  const handleSkillToggle = useCallback(async (skillId, isCompleted) => {
    try {
      if (isCompleted) {
        await uncompleteSkill(skillId);
        if (soundEnabled) playClickSound();
      } else {
        await completeSkill(skillId);
        if (soundEnabled) playSkillCompleteSound();
      }
    } catch (error) {
      console.error('Error toggling skill:', error);
    }
  }, [completeSkill, uncompleteSkill, soundEnabled]);

  // Check if skill is available (prerequisites met)
  const isSkillAvailable = useCallback((skill) => {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
    return skill.prerequisites.every(prereqId => userProgress?.[prereqId]?.completed);
  }, [userProgress]);

  // Get skill status
  const getSkillStatus = useCallback((skill) => {
    const progress = userProgress?.[skill.id];
    if (progress?.completed) return 'completed';
    if (isSkillAvailable(skill)) return 'available';
    return 'locked';
  }, [userProgress, isSkillAvailable]);

  // Filter skills based on current filters
  const filteredSkills = React.useMemo(() => {
    if (!skillTreeData?.skills) return [];
    
    return skillTreeData.skills.filter(skill => {
      // Level filter
      if (filterLevel !== 'all' && skill.difficulty !== filterLevel) return false;
      
      // Completed filter
      if (!showCompleted && userProgress?.[skill.id]?.completed) return false;
      
      return true;
    });
  }, [skillTreeData, filterLevel, showCompleted, userProgress]);

  // Render skill node
  const renderSkillNode = (skill, _index) => {
    const status = getSkillStatus(skill);
    const progress = userProgress?.[skill.id];
    
    const statusStyles = {
      completed: 'bg-green-500/20 border-green-400 text-green-400',
      available: 'bg-primary/20 border-primary text-primary hover:bg-primary/30',
      locked: 'bg-gray-500/20 border-gray-600 text-gray-500'
    };

    const iconStyles = {
      completed: 'text-green-400',
      available: 'text-primary',
      locked: 'text-gray-500'
    };

    return (
      <div
        key={skill.id}
        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
          statusStyles[status]
        } ${selectedSkill?.id === skill.id ? 'ring-2 ring-accent' : ''}`}
        onClick={() => status !== 'locked' && handleSkillClick(skill)}
        onMouseEnter={() => soundEnabled && status !== 'locked' && playHoverSound()}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center'
        }}
      >
        {/* Skill Icon */}
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-dark/50 ${iconStyles[status]}`}>
            {status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : status === 'locked' ? (
              <Lock className="w-5 h-5" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </div>
          
          {/* Difficulty Badge */}
          <span className={`px-2 py-1 text-xs rounded-full ${
            skill.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
            skill.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {skill.difficulty}
          </span>
        </div>

        {/* Skill Title */}
        <h3 className="font-semibold text-light mb-1 text-sm">
          {skill.name}
        </h3>
        
        {/* Skill Description */}
        <p className="text-xs text-light/70 mb-2 line-clamp-2">
          {skill.description}
        </p>

        {/* Progress Bar */}
        {status === 'available' && progress?.progress > 0 && (
          <div className="mb-2">
            <div className="w-full bg-dark/50 rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <span className="text-xs text-light/50">{progress.progress}%</span>
          </div>
        )}

        {/* Estimated Time */}
        <div className="flex items-center space-x-1 text-xs text-light/50">
          <Clock className="w-3 h-3" />
          <span>{skill.estimated_hours}h</span>
        </div>

        {/* Prerequisites Indicator */}
        {skill.prerequisites && skill.prerequisites.length > 0 && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-light/70">Loading skill tree...</p>
        </div>
      </div>
    );
  }

  if (!skillTreeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-light mb-2">Skill Tree Not Found</h2>
          <p className="text-light/70 mb-4">Unable to load the skill tree for {careerName}</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => {
                navigate('/dashboard');
                if (soundEnabled) playClickSound();
              }}
              className="btn-secondary p-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-light font-orbitron">
                {skillTreeData.career_name || careerName}
              </h1>
              <p className="text-light/70">
                {skillTreeData.description || 'Master the skills needed for this career path'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setViewMode(viewMode === 'tree' ? 'list' : 'tree');
                if (soundEnabled) playClickSound();
              }}
              className="btn-secondary p-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
              title={`Switch to ${viewMode === 'tree' ? 'list' : 'tree'} view`}
            >
              {viewMode === 'tree' ? <BookOpen className="w-5 h-5" /> : <TreePine className="w-5 h-5" />}
            </button>
            
            <button
              className="btn-secondary p-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
              title="Share skill tree"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            <button
              className="btn-secondary p-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
              title="Export progress"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 border border-primary/20">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-light/60">Completed</p>
                <p className="text-lg font-bold text-light">{treeStats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 border border-primary/20">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-light/60">Available</p>
                <p className="text-lg font-bold text-light">{treeStats.available}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 border border-primary/20">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-light/60">Locked</p>
                <p className="text-lg font-bold text-light">{treeStats.locked}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 border border-primary/20">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-light/60">Progress</p>
                <p className="text-lg font-bold text-light">
                  {Math.round((treeStats.completed / treeStats.total) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Section */}
        <AIGenerator />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            {/* Difficulty Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            {/* Show Completed Toggle */}
            <label className="flex items-center space-x-2 text-sm text-light/70">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-primary/30 bg-dark/50 text-primary focus:ring-primary"
              />
              <span>Show completed</span>
            </label>
          </div>

          {/* Zoom Controls */}
          {viewMode === 'tree' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                className="btn-secondary p-1 text-sm"
                disabled={zoomLevel <= 0.5}
              >
                -
              </button>
              <span className="text-sm text-light/70 px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                className="btn-secondary p-1 text-sm"
                disabled={zoomLevel >= 2}
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="btn-secondary p-1 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Skills Grid/List */}
        <div className={`${
          viewMode === 'tree' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
        }`}>
          {filteredSkills.map((skill, index) => (
             viewMode === 'tree' ? (
               renderSkillNode(skill, index)
            ) : (
              <div
                key={skill.id}
                className={`glass-card p-4 border border-primary/20 cursor-pointer transition-all duration-300 hover:border-primary/40 ${
                  getSkillStatus(skill) === 'locked' ? 'opacity-50' : ''
                }`}
                onClick={() => getSkillStatus(skill) !== 'locked' && handleSkillClick(skill)}
                onMouseEnter={() => soundEnabled && getSkillStatus(skill) !== 'locked' && playHoverSound()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      getSkillStatus(skill) === 'completed' ? 'bg-green-500/20 text-green-400' :
                      getSkillStatus(skill) === 'available' ? 'bg-primary/20 text-primary' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {getSkillStatus(skill) === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : getSkillStatus(skill) === 'locked' ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-light">{skill.name}</h3>
                      <p className="text-sm text-light/70">{skill.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      skill.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      skill.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {skill.difficulty}
                    </span>
                    <p className="text-xs text-light/50 mt-1">{skill.estimated_hours}h</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <Info className="w-16 h-16 text-light/30 mx-auto mb-4" />
            <p className="text-light/70">No skills match your current filters.</p>
          </div>
        )}
      </div>

      {/* Skill Detail Modal */}
      {showSkillModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary/20">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    getSkillStatus(selectedSkill) === 'completed' ? 'bg-green-500/20 text-green-400' :
                    getSkillStatus(selectedSkill) === 'available' ? 'bg-primary/20 text-primary' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {getSkillStatus(selectedSkill) === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : getSkillStatus(selectedSkill) === 'locked' ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <Target className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-light">{selectedSkill.name}</h2>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedSkill.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      selectedSkill.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedSkill.difficulty}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowSkillModal(false);
                    if (soundEnabled) playClickSound();
                  }}
                  className="text-light/50 hover:text-light transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Skill Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-light mb-2">Description</h3>
                <p className="text-light/80">{selectedSkill.description}</p>
              </div>

              {/* Learning Resources */}
              {selectedSkill.resources && selectedSkill.resources.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-light mb-3">Learning Resources</h3>
                  <div className="space-y-2">
                    {selectedSkill.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-3 bg-dark/30 rounded-lg hover:bg-dark/50 transition-colors"
                        onMouseEnter={() => soundEnabled && playHoverSound()}
                      >
                        <ExternalLink className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-light font-medium">{resource.title}</p>
                          <p className="text-sm text-light/60">{resource.type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {selectedSkill.prerequisites && selectedSkill.prerequisites.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-light mb-3">Prerequisites</h3>
                  <div className="space-y-2">
                    {selectedSkill.prerequisites.map(prereqId => {
                      const prereqSkill = skillTreeData.skills.find(s => s.id === prereqId);
                      const isCompleted = userProgress?.[prereqId]?.completed;
                      
                      return prereqSkill ? (
                        <div
                          key={prereqId}
                          className={`flex items-center space-x-2 p-2 rounded-lg ${
                            isCompleted ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-red-400" />
                          )}
                          <span className={isCompleted ? 'text-green-400' : 'text-red-400'}>
                            {prereqSkill.name}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {getSkillStatus(selectedSkill) === 'available' && (
                  <button
                    onClick={() => {
                      const isCompleted = userProgress?.[selectedSkill.id]?.completed;
                      handleSkillToggle(selectedSkill.id, isCompleted);
                      setShowSkillModal(false);
                    }}
                    className="flex-1 btn-primary"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    {userProgress?.[selectedSkill.id]?.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowSkillModal(false);
                    if (soundEnabled) playClickSound();
                  }}
                  className="flex-1 btn-secondary"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreePage;