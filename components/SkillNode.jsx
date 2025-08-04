import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound, playSkillUnlockSound, playSkillCompleteSound } from '../utils/soundSystem';
import {
  CheckCircle2,
  Circle,
  Lock,
  Clock,
  Target,
  BookOpen,
  ExternalLink,
  Play,
  Brain,
  Code,
  Palette,
  Database,
  Server,
  Smartphone,
  Globe,
  Shield,
  BarChart3,
  Lightbulb,
  Rocket,
  Heart,
  Coffee
} from 'lucide-react';

const SkillNode = ({ skill, position, onSelect, isSelected, connections = [] }) => {
  const { soundEnabled, completeSkill, uncompleteSkill, userProgress } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCompleted = userProgress?.completedSkills?.includes(skill.id) || skill.completed;
  const isAvailable = skill.available || skill.prerequisites?.every(prereq => 
    userProgress?.completedSkills?.includes(prereq)
  ) || skill.prerequisites?.length === 0;
  
  const getSkillIcon = (category) => {
    const iconMap = {
      'frontend': Code,
      'backend': Server,
      'database': Database,
      'mobile': Smartphone,
      'web': Globe,
      'security': Shield,
      'analytics': BarChart3,
      'design': Palette,
      'devops': Settings,
      'ai': Brain,
      'leadership': Users,
      'innovation': Lightbulb,
      'performance': Rocket,
      'soft-skills': Heart,
      'tools': Coffee,
      'default': Target
    };
    
    return iconMap[category?.toLowerCase()] || iconMap.default;
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
      case 'iniciante':
        return 'text-green-400 border-green-400/30';
      case 'intermediate':
      case 'intermediário':
        return 'text-yellow-400 border-yellow-400/30';
      case 'advanced':
      case 'avançado':
        return 'text-red-400 border-red-400/30';
      case 'expert':
      case 'especialista':
        return 'text-purple-400 border-purple-400/30';
      default:
        return 'text-blue-400 border-blue-400/30';
    }
  };
  
  const getNodeStatus = () => {
    if (isCompleted) {
      return {
        bgClass: 'bg-green-500/20 border-green-400/50 shadow-green-400/20',
        iconClass: 'text-green-400',
        statusIcon: CheckCircle2,
        glowClass: 'shadow-lg shadow-green-400/30'
      };
    }
    
    if (!isAvailable) {
      return {
        bgClass: 'bg-gray-600/20 border-gray-500/30 opacity-50',
        iconClass: 'text-gray-500',
        statusIcon: Lock,
        glowClass: ''
      };
    }
    
    return {
      bgClass: 'bg-primary/20 border-primary/40 hover:border-primary/60',
      iconClass: 'text-primary',
      statusIcon: Circle,
      glowClass: isHovered ? 'shadow-lg shadow-primary/30' : ''
    };
  };
  
  const handleClick = () => {
    if (!isAvailable) return;
    
    if (soundEnabled) playClickSound();
    onSelect(skill);
  };
  
  const handleToggleComplete = (e) => {
    e.stopPropagation();
    
    if (!isAvailable) return;
    
    if (isCompleted) {
      uncompleteSkill(skill.id);
      if (soundEnabled) playClickSound();
    } else {
      completeSkill(skill.id);
      if (soundEnabled) playSkillCompleteSound();
    }
  };
  
  const status = getNodeStatus();
  const SkillIcon = getSkillIcon(skill.category);
  const StatusIcon = status.statusIcon;
  
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onClick={handleClick}
      onMouseEnter={() => {
        setIsHovered(true);
        if (soundEnabled && isAvailable) playHoverSound();
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connections */}
      {connections.map((connection, index) => (
        <svg
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: `${Math.abs(connection.dx)}px`,
            height: `${Math.abs(connection.dy)}px`,
            transform: `translate(-50%, -50%) translate(${connection.dx/2}px, ${connection.dy/2}px)`
          }}
        >
          <line
            x1={connection.dx < 0 ? Math.abs(connection.dx) : 0}
            y1={connection.dy < 0 ? Math.abs(connection.dy) : 0}
            x2={connection.dx < 0 ? 0 : Math.abs(connection.dx)}
            y2={connection.dy < 0 ? 0 : Math.abs(connection.dy)}
            stroke={isCompleted ? '#10b981' : isAvailable ? '#3b82f6' : '#6b7280'}
            strokeWidth="2"
            strokeDasharray={!isAvailable ? '5,5' : 'none'}
            className="transition-all duration-300"
          />
        </svg>
      ))}
      
      {/* Skill Node */}
      <div
        className={`
          relative w-16 h-16 rounded-full border-2 transition-all duration-300
          ${status.bgClass} ${status.glowClass}
          ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-dark' : ''}
          ${isHovered && isAvailable ? 'transform scale-110' : ''}
        `}
      >
        {/* Background Glow */}
        {isAvailable && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        )}
        
        {/* Main Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SkillIcon className={`w-6 h-6 ${status.iconClass} transition-colors duration-300`} />
        </div>
        
        {/* Status Icon */}
        <div className="absolute -top-1 -right-1">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-500' : 
            !isAvailable ? 'bg-gray-500' : 'bg-primary'
          }`}>
            <StatusIcon className="w-3 h-3 text-white" />
          </div>
        </div>
        
        {/* Difficulty Indicator */}
        {skill.difficulty && (
          <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 ${getDifficultyColor(skill.difficulty)} bg-dark`}>
            <div className="w-full h-full rounded-full bg-current opacity-60" />
          </div>
        )}
        
        {/* Priority Star */}
        {skill.priority === 'high' && (
          <div className="absolute -top-2 -left-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        )}
      </div>
      
      {/* Skill Label */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
        <div className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${
          isCompleted ? 'text-green-400 bg-green-400/10' :
          !isAvailable ? 'text-gray-500 bg-gray-500/10' :
          'text-light bg-dark/80'
        }`}>
          {skill.name}
        </div>
        
        {/* Estimated Time */}
        {skill.estimatedTime && (
          <div className="flex items-center justify-center space-x-1 mt-1 text-xs text-light/60">
            <Clock className="w-3 h-3" />
            <span>{skill.estimatedTime}</span>
          </div>
        )}
      </div>
      
      {/* Hover Tooltip */}
      {isHovered && isAvailable && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-50">
          <div className="glass-card p-4 border border-primary/20 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <SkillIcon className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-light">{skill.name}</h4>
            </div>
            
            {skill.description && (
              <p className="text-sm text-light/80 mb-3">{skill.description}</p>
            )}
            
            <div className="space-y-2 text-xs">
              {skill.difficulty && (
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 text-light/60" />
                  <span className="text-light/60">Dificuldade:</span>
                  <span className={getDifficultyColor(skill.difficulty).split(' ')[0]}>
                    {skill.difficulty}
                  </span>
                </div>
              )}
              
              {skill.estimatedTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-light/60" />
                  <span className="text-light/60">Tempo estimado:</span>
                  <span className="text-light">{skill.estimatedTime}</span>
                </div>
              )}
              
              {skill.category && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-3 h-3 text-light/60" />
                  <span className="text-light/60">Categoria:</span>
                  <span className="text-light">{skill.category}</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleToggleComplete}
                className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                  isCompleted
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {isCompleted ? 'Desmarcar' : 'Completar'}
              </button>
              
              {skill.resources && skill.resources.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open resources modal or navigate to resources
                  }}
                  className="text-xs py-1 px-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary/20" />
          </div>
        </div>
      )}
      
      {/* Pulse Animation for Available Skills */}
      {isAvailable && !isCompleted && (
        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
      )}
      
      {/* Completion Celebration */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse" />
          {/* Sparkle effects could be added here */}
        </div>
      )}
    </div>
  );
};

export default SkillNode;