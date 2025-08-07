import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import {
  User,
  MapPin,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Target,
  TrendingUp,
  TreePine,
  Award,
  CheckCircle2,
  Trophy,
  Flame,
  Zap,
  Brain,
  Share2,
  Edit3,
  Briefcase,
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  Clock3,
  ArrowRight
} from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user, soundEnabled, userProgress } = useAppStore();
  const { getUserProfile } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  
  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isOwnProfile) {
          setProfileData(user);
        } else {
          const profile = await getUserProfile(userId);
          if (!profile.isPublic) {
            setError('Este perfil é privado');
            return;
          }
          setProfileData(profile);
        }
      } catch (err) {
        setError('Erro ao carregar perfil');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, user, isOwnProfile, getUserProfile]);

  const achievements = [
    {
      id: 'first_skill',
      title: 'Primeira Habilidade',
      description: 'Completou sua primeira habilidade',
      icon: Target,
      color: 'text-green-400',
      unlocked: userProgress?.completedSkills > 0
    },
    {
      id: 'skill_master',
      title: 'Mestre das Habilidades',
      description: 'Completou 10 habilidades',
      icon: Award,
      color: 'text-blue-400',
      unlocked: userProgress?.completedSkills >= 10
    },
    {
      id: 'streak_warrior',
      title: 'Guerreiro da Sequência',
      description: 'Manteve uma sequência de 7 dias',
      icon: Flame,
      color: 'text-orange-400',
      unlocked: userProgress?.currentStreak >= 7
    },
    {
      id: 'tree_explorer',
      title: 'Explorador de Árvores',
      description: 'Criou 3 árvores de habilidades',
      icon: TreePine,
      color: 'text-purple-400',
      unlocked: userProgress?.totalTrees >= 3
    },
    {
      id: 'level_up',
      title: 'Subiu de Nível',
      description: 'Alcançou o nível 5',
      icon: TrendingUp,
      color: 'text-yellow-400',
      unlocked: userProgress?.level >= 5
    },
    {
      id: 'speed_learner',
      title: 'Aprendiz Veloz',
      description: 'Completou 5 habilidades em um dia',
      icon: Zap,
      color: 'text-cyan-400',
      unlocked: false // This would need daily tracking
    }
  ];

  const recentActivity = [
    {
      type: 'skill_completed',
      title: 'Completou "React Hooks"',
      time: '2 horas atrás',
      icon: CheckCircle2,
      color: 'text-green-400'
    },
    {
      type: 'tree_created',
      title: 'Criou árvore "Frontend Development"',
      time: '1 dia atrás',
      icon: TreePine,
      color: 'text-blue-400'
    },
    {
      type: 'achievement_unlocked',
      title: 'Desbloqueou "Mestre das Habilidades"',
      time: '3 dias atrás',
      icon: Trophy,
      color: 'text-yellow-400'
    },
    {
      type: 'skill_completed',
      title: 'Completou "JavaScript ES6"',
      time: '5 dias atrás',
      icon: CheckCircle2,
      color: 'text-green-400'
    }
  ];

  const skillCategories = [
    {
      name: 'Frontend',
      completed: 12,
      total: 20,
      color: 'bg-blue-500'
    },
    {
      name: 'Backend',
      completed: 8,
      total: 15,
      color: 'bg-green-500'
    },
    {
      name: 'DevOps',
      completed: 5,
      total: 12,
      color: 'bg-purple-500'
    },
    {
      name: 'Design',
      completed: 3,
      total: 8,
      color: 'bg-pink-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-light/60">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-light mb-2">{error}</h2>
          <p className="text-light/60 mb-6">
            Este usuário optou por manter seu perfil privado.
          </p>
          <Link
            to="/"
            className="btn-primary"
            onMouseEnter={() => soundEnabled && playHoverSound()}
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border border-primary/20 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {userProgress?.level || 1}
          </div>
          <div className="text-light/60 text-sm">Nível</div>
        </div>
        
        <div className="glass-card p-6 border border-primary/20 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {userProgress?.completedSkills || 0}
          </div>
          <div className="text-light/60 text-sm">Habilidades</div>
        </div>
        
        <div className="glass-card p-6 border border-primary/20 text-center">
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {userProgress?.currentStreak || 0}
          </div>
          <div className="text-light/60 text-sm">Sequência</div>
        </div>
        
        <div className="glass-card p-6 border border-primary/20 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {userProgress?.totalTrees || 0}
          </div>
          <div className="text-light/60 text-sm">Árvores</div>
        </div>
      </div>

      {/* Progress by Category */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span>Progresso por Categoria</span>
        </h3>
        
        <div className="space-y-4">
          {skillCategories.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-light font-medium">{category.name}</span>
                <span className="text-light/60 text-sm">
                  {category.completed}/{category.total}
                </span>
              </div>
              <div className="w-full bg-dark/50 rounded-full h-2">
                <div
                  className={`${category.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${(category.completed / category.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Atividade Recente</span>
        </h3>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-light font-medium">{activity.title}</p>
                <p className="text-light/60 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`glass-card p-6 border transition-all duration-300 ${
              achievement.unlocked
                ? 'border-primary/40 hover:border-primary/60 hover:transform hover:scale-105'
                : 'border-gray-600/20 opacity-50'
            }`}
            onMouseEnter={() => soundEnabled && playHoverSound()}
          >
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                achievement.unlocked ? 'bg-primary/20' : 'bg-gray-600/20'
              }`}>
                <achievement.icon className={`w-8 h-8 ${
                  achievement.unlocked ? achievement.color : 'text-gray-500'
                }`} />
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${
                achievement.unlocked ? 'text-light' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm ${
                achievement.unlocked ? 'text-light/70' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
              
              {achievement.unlocked && (
                <div className="mt-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Achievement Stats */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Estatísticas de Conquistas</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {achievements.filter(a => a.unlocked).length}
            </div>
            <div className="text-light/60">Desbloqueadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400 mb-2">
              {achievements.filter(a => !a.unlocked).length}
            </div>
            <div className="text-light/60">Bloqueadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
            </div>
            <div className="text-light/60">Completude</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkillsTab = () => (
    <div className="space-y-8">
      {/* Skills Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-6 border border-primary/20">
          <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Habilidades por Dificuldade</span>
          </h3>
          
          <div className="space-y-4">
            {[
              { level: 'Iniciante', count: 15, color: 'bg-green-500' },
              { level: 'Intermediário', count: 10, color: 'bg-yellow-500' },
              { level: 'Avançado', count: 3, color: 'bg-red-500' }
            ].map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${skill.color}`}></div>
                  <span className="text-light">{skill.level}</span>
                </div>
                <span className="text-light/60">{skill.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card p-6 border border-primary/20">
          <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
            <Clock3 className="w-5 h-5 text-primary" />
            <span>Tempo de Aprendizado</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-light/70">Total investido</span>
              <span className="text-light font-semibold">127 horas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light/70">Média por habilidade</span>
              <span className="text-light font-semibold">4.5 horas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light/70">Esta semana</span>
              <span className="text-light font-semibold">12 horas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Trees */}
      <div className="glass-card p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-light flex items-center space-x-2">
            <TreePine className="w-5 h-5 text-primary" />
            <span>Árvores de Habilidades</span>
          </h3>
          
          {isOwnProfile && (
            <Link
              to="/dashboard"
              className="btn-secondary text-sm"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              Ver Todas
            </Link>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Frontend Development',
              progress: 75,
              skills: 20,
              completed: 15,
              category: 'Desenvolvimento'
            },
            {
              name: 'Data Science',
              progress: 45,
              skills: 18,
              completed: 8,
              category: 'Ciência de Dados'
            },
            {
              name: 'DevOps Engineering',
              progress: 30,
              skills: 15,
              completed: 5,
              category: 'Infraestrutura'
            }
          ].map((tree, index) => (
            <div
              key={index}
              className="glass-card p-4 border border-primary/20 hover:border-primary/40 transition-colors"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <div className="mb-4">
                <h4 className="font-semibold text-light mb-1">{tree.name}</h4>
                <p className="text-light/60 text-sm">{tree.category}</p>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-light/70">Progresso</span>
                  <span className="text-light">{tree.progress}%</span>
                </div>
                <div className="w-full bg-dark/50 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${tree.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-light/60">
                <span>{tree.completed}/{tree.skills} habilidades</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="glass-card p-8 border border-primary/20 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-4xl font-bold text-dark">
                {profileData?.displayName?.charAt(0) || 'U'}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-light font-orbitron">
                  {profileData?.displayName || 'Usuário'}
                </h1>
                
                {isOwnProfile && (
                  <Link
                    to="/settings"
                    className="btn-secondary text-sm flex items-center space-x-2"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar</span>
                  </Link>
                )}
              </div>
              
              {profileData?.bio && (
                <p className="text-light/80 mb-4 max-w-2xl">{profileData.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-light/60">
                {profileData?.jobTitle && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{profileData.jobTitle}</span>
                    {profileData?.company && <span>@ {profileData.company}</span>}
                  </div>
                )}
                
                {profileData?.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Membro desde {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4 mt-4">
                {profileData?.website && (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light/60 hover:text-primary transition-colors"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                
                {profileData?.github && (
                  <a
                    href={`https://github.com/${profileData.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light/60 hover:text-primary transition-colors"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                
                {profileData?.twitter && (
                  <a
                    href={`https://twitter.com/${profileData.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light/60 hover:text-primary transition-colors"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                
                {profileData?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profileData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light/60 hover:text-primary transition-colors"
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Share Button */}
            {!isOwnProfile && (
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: `Perfil de ${profileData?.displayName}`,
                      url: window.location.href
                    }) || navigator.clipboard.writeText(window.location.href);
                    if (soundEnabled) playClickSound();
                  }}
                  className="btn-secondary flex items-center space-x-2"
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-2 border border-primary/20">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Visão Geral', icon: User },
                { id: 'achievements', label: 'Conquistas', icon: Trophy },
                { id: 'skills', label: 'Habilidades', icon: Brain }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (soundEnabled) playClickSound();
                  }}
                  onMouseEnter={() => soundEnabled && playHoverSound()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary text-dark font-semibold'
                      : 'text-light/70 hover:text-light hover:bg-primary/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'skills' && renderSkillsTab()}
      </div>
    </div>
  );
};

export default ProfilePage;