import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useAuth } from '../hooks/useAuth';
import { playHoverSound, playClickSound, playSuccessSound, playErrorSound } from '../utils/soundSystem';
import {
  User,
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Bell,

  Shield,
  Key,
  Trash2,
  Save,




  Briefcase,
  Globe,
  Github,
  Twitter,
  Linkedin,
  AlertTriangle
} from 'lucide-react';

const SettingsPage = () => {
  const { 
    soundEnabled, 
    theme, 
    user, 
    userPreferences,
    setSoundEnabled, 
    setTheme,
    setNotification,
    updateUserPreferences
  } = useAppStore();
  
  const { updateProfile, resetPassword, deleteAccount } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
    jobTitle: '',
    company: '',
    birthDate: '',
    phone: '',
    isPublic: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    skillReminders: true,
    communityUpdates: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        github: user.github || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
        jobTitle: user.jobTitle || '',
        company: user.company || '',
        birthDate: user.birthDate || '',
        phone: user.phone || '',
        isPublic: user.isPublic || false,
        emailNotifications: userPreferences?.emailNotifications ?? true,
        pushNotifications: userPreferences?.pushNotifications ?? true,
        weeklyDigest: userPreferences?.weeklyDigest ?? true,
        skillReminders: userPreferences?.skillReminders ?? true,
        communityUpdates: userPreferences?.communityUpdates ?? false
      });
    }
  }, [user, userPreferences]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };



  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Nome é obrigatório';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'URL deve começar com http:// ou https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      if (soundEnabled) playErrorSound();
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        github: formData.github,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        jobTitle: formData.jobTitle,
        company: formData.company,
        birthDate: formData.birthDate,
        phone: formData.phone,
        isPublic: formData.isPublic
      });
      
      await updateUserPreferences({
        emailNotifications: formData.emailNotifications,
        pushNotifications: formData.pushNotifications,
        weeklyDigest: formData.weeklyDigest,
        skillReminders: formData.skillReminders,
        communityUpdates: formData.communityUpdates
      });
      
      setNotification({
        type: 'success',
        title: 'Perfil Atualizado',
        message: 'Suas informações foram salvas com sucesso!'
      });
      
      if (soundEnabled) playSuccessSound();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erro ao Salvar',
        message: error.message || 'Erro ao atualizar perfil'
      });
      
      if (soundEnabled) playErrorSound();
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      if (soundEnabled) playErrorSound();
      return;
    }

    setSaving(true);
    try {
      await resetPassword(user.email);
      
      setNotification({
        type: 'success',
        title: 'Email Enviado',
        message: 'Verifique seu email para redefinir a senha'
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
      
      if (soundEnabled) playSuccessSound();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Erro ao enviar email de redefinição'
      });
      
      if (soundEnabled) playErrorSound();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      await deleteAccount();
      
      setNotification({
        type: 'success',
        title: 'Conta Excluída',
        message: 'Sua conta foi excluída com sucesso'
      });
      
      if (soundEnabled) playSuccessSound();
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Erro ao excluir conta'
      });
      
      if (soundEnabled) playErrorSound();
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <User className="w-5 h-5 text-primary" />
          <span>Informações Básicas</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2">
              Nome de Exibição *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className={`input-field ${errors.displayName ? 'border-red-500' : ''}`}
              placeholder="Seu nome"
            />
            {errors.displayName && (
              <p className="text-red-400 text-sm mt-1">{errors.displayName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
              placeholder="seu@email.com"
            />
            <p className="text-light/60 text-xs mt-1">
              Para alterar o email, entre em contato com o suporte
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-light/80 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Conte um pouco sobre você..."
              maxLength={500}
            />
            <p className="text-light/60 text-xs mt-1">
              {formData.bio.length}/500 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>Informações Profissionais</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2">
              Cargo
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="input-field"
              placeholder="Desenvolvedor Full Stack"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2">
              Empresa
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="input-field"
              placeholder="Nome da empresa"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2">
              Localização
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="input-field"
              placeholder="São Paulo, Brasil"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={`input-field ${errors.website ? 'border-red-500' : ''}`}
              placeholder="https://seusite.com"
            />
            {errors.website && (
              <p className="text-red-400 text-sm mt-1">{errors.website}</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-primary" />
          <span>Redes Sociais</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2 flex items-center space-x-2">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </label>
            <input
              type="text"
              value={formData.github}
              onChange={(e) => handleInputChange('github', e.target.value)}
              className="input-field"
              placeholder="seuusuario"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2 flex items-center space-x-2">
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => handleInputChange('twitter', e.target.value)}
              className="input-field"
              placeholder="@seuusuario"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light/80 mb-2 flex items-center space-x-2">
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </label>
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              className="input-field"
              placeholder="seuusuario"
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Privacidade</span>
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="w-4 h-4 text-primary bg-dark border-primary/30 rounded focus:ring-primary focus:ring-2"
            />
            <div>
              <span className="text-light font-medium">Perfil Público</span>
              <p className="text-light/60 text-sm">
                Permitir que outros usuários vejam seu perfil e progresso
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
          onMouseEnter={() => soundEnabled && playHoverSound()}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary" />
          <span>Preferências de Notificação</span>
        </h3>
        
        <div className="space-y-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-light font-medium">Notificações por Email</span>
              <p className="text-light/60 text-sm">
                Receber atualizações importantes por email
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              className="w-4 h-4 text-primary bg-dark border-primary/30 rounded focus:ring-primary focus:ring-2"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-light font-medium">Notificações Push</span>
              <p className="text-light/60 text-sm">
                Receber notificações no navegador
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.pushNotifications}
              onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
              className="w-4 h-4 text-primary bg-dark border-primary/30 rounded focus:ring-primary focus:ring-2"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-light font-medium">Resumo Semanal</span>
              <p className="text-light/60 text-sm">
                Receber um resumo do seu progresso toda semana
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.weeklyDigest}
              onChange={(e) => handleInputChange('weeklyDigest', e.target.checked)}
              className="w-4 h-4 text-primary bg-dark border-primary/30 rounded focus:ring-primary focus:ring-2"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-light font-medium">Lembretes de Habilidades</span>
              <p className="text-light/60 text-sm">
                Receber lembretes para continuar aprendendo
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.skillReminders}
              onChange={(e) => handleInputChange('skillReminders', e.target.checked)}
              className="w-4 h-4 text-primary bg-dark border-primary/30 rounded focus:ring-primary focus:ring-2"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-light font-medium">Atualizações da Comunidade</span>
              <p className="text-light/60 text-sm">
                Receber notificações sobre atividades da comunidade
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.communityUpdates}
              onChange={(e) => handleInputChange('communityUpdates', e.target.checked)}
              className="w-4 h-4 text-primary bg-dark border-primary/30 rounded focus:ring-primary focus:ring-2"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
          onMouseEnter={() => soundEnabled && playHoverSound()}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Preferências'}</span>
        </button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Aparência e Som</span>
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-light font-medium">Tema</span>
              <p className="text-light/60 text-sm">
                Escolha entre tema claro ou escuro
              </p>
            </div>
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                if (soundEnabled) playClickSound();
              }}
              onMouseEnter={() => soundEnabled && playHoverSound()}
              className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Claro</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-light font-medium">Efeitos Sonoros</span>
              <p className="text-light/60 text-sm">
                Ativar ou desativar sons da interface
              </p>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playClickSound();
              }}
              onMouseEnter={() => soundEnabled && playHoverSound()}
              className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Ativado</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Desativado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="glass-card p-6 border border-primary/20">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <Key className="w-5 h-5 text-primary" />
          <span>Alterar Senha</span>
        </h3>
        
        {!showPasswordFields ? (
          <div>
            <p className="text-light/80 mb-4">
              Para alterar sua senha, enviaremos um link de redefinição para seu email.
            </p>
            <button
              onClick={() => setShowPasswordFields(true)}
              className="btn-secondary"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              Alterar Senha
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-light/80 mb-4">
              Clique no botão abaixo para receber um email com instruções para redefinir sua senha.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="btn-primary"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                {saving ? 'Enviando...' : 'Enviar Email de Redefinição'}
              </button>
              
              <button
                onClick={() => setShowPasswordFields(false)}
                className="btn-secondary"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account */}
      <div className="glass-card p-6 border border-red-500/20 bg-red-500/5">
        <h3 className="text-xl font-semibold text-light mb-6 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Zona de Perigo</span>
        </h3>
        
        {!showDeleteConfirm ? (
          <div>
            <p className="text-light/80 mb-4">
              Excluir sua conta removerá permanentemente todos os seus dados, 
              incluindo progresso, skill trees e configurações. Esta ação não pode ser desfeita.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              onMouseEnter={() => soundEnabled && playHoverSound()}
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Conta</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-400">Confirmação Necessária</span>
              </div>
              <p className="text-light/80">
                Tem certeza de que deseja excluir sua conta? Esta ação é irreversível 
                e todos os seus dados serão perdidos permanentemente.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                <Trash2 className="w-4 h-4" />
                <span>{saving ? 'Excluindo...' : 'Sim, Excluir Conta'}</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                onMouseEnter={() => soundEnabled && playHoverSound()}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User, content: renderProfileTab },
    { id: 'notifications', label: 'Notificações', icon: Bell, content: renderNotificationsTab },
    { id: 'appearance', label: 'Aparência', icon: Settings, content: renderAppearanceTab },
    { id: 'security', label: 'Segurança', icon: Shield, content: renderSecurityTab }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light mb-2 font-orbitron">
            Configurações
          </h1>
          <p className="text-light/60">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 border border-primary/20 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (soundEnabled) playClickSound();
                    }}
                    onMouseEnter={() => soundEnabled && playHoverSound()}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-primary text-dark font-semibold'
                        : 'text-light/70 hover:text-light hover:bg-primary/10'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {tabs.find(tab => tab.id === activeTab)?.content()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;