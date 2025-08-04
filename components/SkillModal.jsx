import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { playClickSound, playSkillCompleteSound } from '../utils/soundSystem';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  BookOpen,
  ExternalLink,
  Play,
  TrendingUp,
  FileText,
  Video,
  Link,
  Download,
  Share2,
  Flag,
  Lightbulb,
  Code,
  Palette,
  Database,
  Server,
  Smartphone,
  Globe,
  Shield,
  BarChart3,
  Settings,
  Brain,
  Heart,
  Coffee
} from 'lucide-react';

const SkillModal = ({ skill, isOpen, onClose }) => {
  const { soundEnabled, completeSkill, uncompleteSkill, userProgress } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCompleting, setIsCompleting] = useState(false);
  
  const isCompleted = userProgress?.completedSkills?.includes(skill?.id) || skill?.completed;
  const isAvailable = skill?.available || skill?.prerequisites?.every(prereq => 
    userProgress?.completedSkills?.includes(prereq)
  ) || skill?.prerequisites?.length === 0;
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen || !skill) return null;
  
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
      'performance': TrendingUp,
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
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'intermediate':
      case 'intermediário':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'advanced':
      case 'avançado':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'expert':
      case 'especialista':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };
  
  const handleToggleComplete = async () => {
    if (!isAvailable || isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      if (isCompleted) {
        await uncompleteSkill(skill.id);
        if (soundEnabled) playClickSound();
      } else {
        await completeSkill(skill.id);
        if (soundEnabled) playSkillCompleteSound();
      }
    } catch (error) {
      console.error('Error toggling skill completion:', error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleClose = () => {
    if (soundEnabled) playClickSound();
    onClose();
  };
  
  const SkillIcon = getSkillIcon(skill.category);
  
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BookOpen },
    { id: 'resources', label: 'Recursos', icon: ExternalLink },
    { id: 'progress', label: 'Progresso', icon: TrendingUp },
    { id: 'community', label: 'Comunidade', icon: Users }
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-card border border-primary/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/20">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-500/20 text-green-400' :
              !isAvailable ? 'bg-gray-500/20 text-gray-500' :
              'bg-primary/20 text-primary'
            }`}>
              <SkillIcon className="w-6 h-6" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-light">{skill.name}</h2>
              <div className="flex items-center space-x-4 mt-1">
                {skill.difficulty && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(skill.difficulty)}`}>
                    {skill.difficulty}
                  </span>
                )}
                
                {skill.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                    {skill.category}
                  </span>
                )}
                
                {skill.priority === 'high' && (
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs">Alta Prioridade</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Complete/Uncomplete Button */}
            <button
              onClick={handleToggleComplete}
              disabled={!isAvailable || isCompleting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isCompleted
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCompleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isCompleted ? 'Desmarcar' : 'Completar'}
              </span>
            </button>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-primary/20">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (soundEnabled) playClickSound();
                }}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-light/60 hover:text-light hover:bg-primary/5'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              {skill.description && (
                <div>
                  <h3 className="text-lg font-semibold text-light mb-3">Descrição</h3>
                  <p className="text-light/80 leading-relaxed">{skill.description}</p>
                </div>
              )}
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-light">Informações Básicas</h4>
                  
                  {skill.estimatedTime && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-sm text-light/60">Tempo Estimado</span>
                        <p className="text-light font-medium">{skill.estimatedTime}</p>
                      </div>
                    </div>
                  )}
                  
                  {skill.xpReward && (
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-sm text-light/60">Recompensa XP</span>
                        <p className="text-light font-medium">{skill.xpReward} pontos</p>
                      </div>
                    </div>
                  )}
                  
                  {skill.completionRate && (
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-sm text-light/60">Taxa de Conclusão</span>
                        <p className="text-light font-medium">{skill.completionRate}%</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Prerequisites */}
                {skill.prerequisites && skill.prerequisites.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-light">Pré-requisitos</h4>
                    <div className="space-y-2">
                      {skill.prerequisites.map((prereq, index) => {
                        const isPrereqCompleted = userProgress?.completedSkills?.includes(prereq);
                        return (
                          <div key={index} className="flex items-center space-x-2">
                            {isPrereqCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-500" />
                            )}
                            <span className={isPrereqCompleted ? 'text-light' : 'text-light/60'}>
                              {prereq}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Learning Objectives */}
              {skill.objectives && skill.objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-light mb-3">Objetivos de Aprendizado</h3>
                  <ul className="space-y-2">
                    {skill.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-light/80">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Skills You'll Learn */}
              {skill.skills && skill.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-light mb-3">Habilidades que Você Aprenderá</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.skills.map((skillItem, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-primary/10 text-primary border border-primary/30 rounded-full"
                      >
                        {skillItem}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {skill.resources && skill.resources.length > 0 ? (
                <div className="grid gap-4">
                  {skill.resources.map((resource, index) => {
                    const getResourceIcon = (type) => {
                      switch (type?.toLowerCase()) {
                        case 'video': return Video;
                        case 'article': return FileText;
                        case 'documentation': return BookOpen;
                        case 'course': return Play;
                        case 'tool': return Settings;
                        case 'download': return Download;
                        default: return Link;
                      }
                    };
                    
                    const ResourceIcon = getResourceIcon(resource.type);
                    
                    return (
                      <div key={index} className="glass-card p-4 border border-primary/20">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <ResourceIcon className="w-5 h-5 text-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-light mb-1">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-light/60 mb-2">{resource.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-light/60">
                              {resource.type && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                                  {resource.type}
                                </span>
                              )}
                              
                              {resource.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{resource.duration}</span>
                                </div>
                              )}
                              
                              {resource.difficulty && (
                                <div className="flex items-center space-x-1">
                                  <Target className="w-3 h-3" />
                                  <span>{resource.difficulty}</span>
                                </div>
                              )}
                            </div>
                            
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
                                onClick={() => soundEnabled && playClickSound()}
                              >
                                <span>Acessar Recurso</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-light/30 mx-auto mb-4" />
                  <p className="text-light/60">Nenhum recurso disponível para esta habilidade.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Completion Status */}
              <div className="glass-card p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-light">Status de Conclusão</h4>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    isCompleted ? 'bg-green-500/20 text-green-400' :
                    !isAvailable ? 'bg-gray-500/20 text-gray-500' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {isCompleted ? 'Concluída' : !isAvailable ? 'Bloqueada' : 'Disponível'}
                  </div>
                </div>
                
                {isCompleted && (
                  <div className="text-sm text-light/60">
                    <p>Parabéns! Você concluiu esta habilidade.</p>
                    {/* Add completion date if available */}
                  </div>
                )}
                
                {!isAvailable && (
                  <div className="text-sm text-light/60">
                    <p>Complete os pré-requisitos para desbloquear esta habilidade.</p>
                  </div>
                )}
              </div>
              
              {/* Progress Tracking */}
              <div className="glass-card p-4 border border-primary/20">
                <h4 className="font-semibold text-light mb-4">Acompanhamento de Progresso</h4>
                
                {/* This would be populated with actual progress data */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light/60">Recursos Acessados</span>
                    <span className="text-light">0 / {skill.resources?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light/60">Tempo Investido</span>
                    <span className="text-light">0h</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light/60">Última Atividade</span>
                    <span className="text-light">-</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-light/30 mx-auto mb-4" />
                <p className="text-light/60 mb-2">Recursos da Comunidade</p>
                <p className="text-sm text-light/40">Discussões, dúvidas e compartilhamento de experiências em breve.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillModal;