// ✨ Particle System - Project Odysseus
// Sistema de partículas sutis e otimizadas para UI/UX premium

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createLogger } from '../../utils/logger.js';
import { trackEvent } from '../../utils/metrics.js';

const logger = createLogger('ParticleSystem');

// 🎨 Configurações das partículas
const PARTICLE_CONFIG = {
  // Configurações de performance otimizadas
  maxParticles: {
    mobile: 5,
    tablet: 8,
    desktop: 12
  },
  
  // Configurações visuais
  colors: {
    primary: ['#3b82f6', '#6366f1', '#8b5cf6'],
    secondary: ['#06b6d4', '#0891b2', '#0e7490'],
    accent: ['#f59e0b', '#d97706', '#b45309'],
    neutral: ['#6b7280', '#9ca3af', '#d1d5db']
  },
  
  // Configurações de movimento otimizadas
  speed: {
    min: 0.1,
    max: 0.4
  },
  
  size: {
    min: 2,
    max: 5
  },
  
  opacity: {
    min: 0.3,
    max: 0.8
  },
  
  // Configurações de área segura (evitar sobreposição com texto)
  safeZones: {
    header: { top: 0, height: 80 },
    sidebar: { left: 0, width: 280 },
    content: { margin: 20 }
  }
};

// 🔧 Detectar tipo de dispositivo
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// ⚡ Classe otimizada para partículas
class Particle {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Posição inicial em área segura
    this.x = this.getRandomSafeX();
    this.y = this.getRandomSafeY();
    
    // Propriedades de movimento
    this.vx = (Math.random() - 0.5) * (config.speed?.max || PARTICLE_CONFIG.speed.max);
    this.vy = (Math.random() - 0.5) * (config.speed?.max || PARTICLE_CONFIG.speed.max);
    
    // Propriedades visuais
    this.size = Math.random() * (PARTICLE_CONFIG.size.max - PARTICLE_CONFIG.size.min) + PARTICLE_CONFIG.size.min;
    this.opacity = Math.random() * (PARTICLE_CONFIG.opacity.max - PARTICLE_CONFIG.opacity.min) + PARTICLE_CONFIG.opacity.min;
    this.color = this.getRandomColor(config.colorScheme || 'primary');
    
    // Propriedades de animação
    this.life = 1.0;
    this.decay = Math.random() * 0.005 + 0.001;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    
    // Configurações de área segura
    this.safeZones = config.safeZones || PARTICLE_CONFIG.safeZones || {
      header: { top: 0, height: 80 },
      sidebar: { left: 0, width: 280 },
      content: { margin: 20 }
    };
  }
  
  // 🎯 Obter posição X segura (evitar sidebar)
  getRandomSafeX() {
    const sidebarWidth = this.safeZones?.sidebar?.width || 280;
    const margin = this.safeZones?.content?.margin || 20;
    const minX = sidebarWidth + margin;
    const maxX = this.canvas.width - margin;
    
    return Math.random() * (maxX - minX) + minX;
  }
  
  // 🎯 Obter posição Y segura (evitar header)
  getRandomSafeY() {
    const headerHeight = this.safeZones?.header?.height || 80;
    const margin = this.safeZones?.content?.margin || 20;
    const minY = headerHeight + margin;
    const maxY = this.canvas.height - margin;
    
    return Math.random() * (maxY - minY) + minY;
  }
  
  // 🌈 Obter cor aleatória do esquema
  getRandomColor(scheme) {
    const colors = PARTICLE_CONFIG.colors[scheme] || PARTICLE_CONFIG.colors.primary;
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 🔄 Atualizar partícula
  update() {
    // Movimento
    this.x += this.vx;
    this.y += this.vy;
    
    // Efeito de pulsação sutil
    this.pulse += this.pulseSpeed;
    const pulseMultiplier = 1 + Math.sin(this.pulse) * 0.1;
    
    // Decaimento da vida otimizado
    this.life -= this.decay * 1.5;
    
    // Verificar limites e reposicionar se necessário
    this.checkBounds();
    
    return this.life > 0;
  }
  
  // 🔲 Verificar limites da tela
  checkBounds() {
    const margin = this.safeZones?.content?.margin || 20;
    const sidebarWidth = this.safeZones?.sidebar?.width || 280;
    const headerHeight = this.safeZones?.header?.height || 80;
    
    // Reposicionar se sair da área segura
    if (this.x < sidebarWidth + margin || this.x > this.canvas.width - margin) {
      this.x = this.getRandomSafeX();
      this.life = 1.0; // Renovar vida
    }
    
    if (this.y < headerHeight + margin || this.y > this.canvas.height - margin) {
      this.y = this.getRandomSafeY();
      this.life = 1.0; // Renovar vida
    }
  }
  
  // 🎨 Renderizar partícula
  render() {
    if (this.life <= 0) return;
    
    this.ctx.save();
    
    // Aplicar transparência baseada na vida
    const currentOpacity = this.opacity * this.life;
    this.ctx.globalAlpha = currentOpacity;
    
    // Aplicar efeito de pulsação
    const pulseSize = this.size * (1 + Math.sin(this.pulse) * 0.1);
    
    // Criar gradiente sutil
    const gradient = this.ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, pulseSize * 2
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');
    
    // Desenhar partícula
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

// ✨ Componente principal do sistema de partículas
const ParticleSystem = ({ 
  enabled = true, 
  intensity = 'low',
  colorScheme = 'primary',
  className = '',
  style = {},
  ...props 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  
  // 📊 Configurações baseadas na intensidade
  const getIntensityConfig = useCallback((intensity, deviceType) => {
    const baseCount = PARTICLE_CONFIG.maxParticles[deviceType];
    
    const intensityMultipliers = {
      low: 0.3,
      medium: 0.5,
      high: 0.7,
      ultra: 1.0
    };
    
    const multiplier = intensityMultipliers[intensity] || intensityMultipliers.medium;
    
    return {
      maxParticles: Math.floor(baseCount * multiplier),
      spawnRate: multiplier,
      colorScheme
    };
  }, [colorScheme]);
  
  // 🔄 Redimensionar canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Configurar tamanho do canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Atualizar tipo de dispositivo
    setDeviceType(getDeviceType());
    
    logger.info('Canvas redimensionado', {
      width: canvas.width,
      height: canvas.height,
      dpr,
      deviceType: getDeviceType()
    });
  }, []);
  
  // 🎯 Criar nova partícula
  const createParticle = useCallback((config) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    return new Particle(canvas, {
      ...config,
      colorScheme,
      safeZones: PARTICLE_CONFIG.safeZones
    });
  }, [colorScheme]);
  
  // 🔄 Loop de animação ultra otimizado com controle de FPS
  const frameCount = useRef(0);
  const lastTime = useRef(0);
  
  const animate = useCallback((currentTime) => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    
    // Controle de FPS - limitar a 30 FPS para melhor performance
    if (currentTime - lastTime.current < 33) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTime.current = currentTime;
    
    const ctx = canvas.getContext('2d');
    const config = getIntensityConfig(intensity, deviceType);
    
    // Limpar canvas com performance otimizada
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Atualizar partículas existentes com throttling agressivo
    let activeParticles = 0;
    const maxAllowed = Math.floor(config.maxParticles * 0.7); // Reduzir 30%
    
    particlesRef.current = particlesRef.current.filter(particle => {
      if (activeParticles >= maxAllowed) return false;
      
      const alive = particle.update();
      if (alive) {
        particle.render();
        activeParticles++;
      }
      return alive;
    });
    
    // Adicionar novas partículas muito limitado
    frameCount.current++;
    if (frameCount.current % 10 === 0) { // Só adicionar a cada 10 frames
      const particlesToAdd = Math.min(1, maxAllowed - particlesRef.current.length);
      for (let i = 0; i < particlesToAdd; i++) {
        const newParticle = createParticle(config);
        if (newParticle) {
          particlesRef.current.push(newParticle);
        }
      }
    }
    
    // Continuar animação
    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, intensity, deviceType, getIntensityConfig, createParticle]);
  
  // 🚀 Inicializar sistema
  useEffect(() => {
    if (!enabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Configurar canvas
    resizeCanvas();
    
    // Iniciar animação
    setIsVisible(true);
    animate();
    
    // Event listeners
    const handleResize = () => {
      resizeCanvas();
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausar animação quando tab não está visível
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        // Retomar animação
        animate();
      }
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Métricas
    trackEvent('particle_system_initialized', {
      intensity,
      colorScheme,
      deviceType
    });
    
    logger.info('Sistema de partículas inicializado', {
      intensity,
      colorScheme,
      deviceType,
      maxParticles: getIntensityConfig(intensity, deviceType).maxParticles
    });
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      particlesRef.current = [];
      setIsVisible(false);
      
      logger.info('Sistema de partículas finalizado');
    };
  }, [enabled, animate, resizeCanvas, intensity, colorScheme, getIntensityConfig, deviceType]);
  
  // 🎨 Estilos do canvas
  const canvasStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 999,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
    mixBlendMode: 'screen',
    ...style
  };
  
  if (!enabled) {
    return null;
  }
  
  // Filtrar props válidas para canvas
  const { 
    enabled: _enabled, 
    intensity: _intensity, 
    colorScheme: _colorScheme, 
    ...validCanvasProps 
  } = props;

  return (
    <canvas
      ref={canvasRef}
      className={`particle-system ${className}`}
      style={canvasStyle}
      aria-hidden="true"
      {...validCanvasProps}
    />
  );
};

// 🎛️ Hook para controlar partículas
export const useParticleSystem = (initialConfig = {}) => {
  const [config, setConfig] = useState({
    enabled: true,
    intensity: 'medium',
    colorScheme: 'primary',
    ...initialConfig
  });
  
  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  const toggleEnabled = useCallback(() => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);
  
  const setIntensity = useCallback((intensity) => {
    setConfig(prev => ({ ...prev, intensity }));
  }, []);
  
  const setColorScheme = useCallback((colorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  }, []);
  
  return {
    config,
    updateConfig,
    toggleEnabled,
    setIntensity,
    setColorScheme
  };
};

// 🎨 Componentes pré-configurados
export const SubtleParticles = (props) => (
  <ParticleSystem intensity="low" colorScheme="neutral" {...props} />
);

export const DynamicParticles = (props) => (
  <ParticleSystem intensity="medium" colorScheme="primary" {...props} />
);

export const IntenseParticles = (props) => (
  <ParticleSystem intensity="high" colorScheme="accent" {...props} />
);

// 🌟 Componente com controles de performance automáticos
export const AdaptiveParticleSystem = ({ children, ...props }) => {
  const [performanceMode, setPerformanceMode] = useState('auto');
  const frameTimeRef = useRef([]);
  
  useEffect(() => {
    let frameCount = 0;
    const checkPerformance = () => {
      frameCount++;
      
      if (frameCount % 60 === 0) { // Verificar a cada 60 frames
        const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
        
        if (avgFrameTime > 20) { // Se frame time > 20ms, reduzir intensidade
          setPerformanceMode('low');
        } else if (avgFrameTime < 10) { // Se frame time < 10ms, pode aumentar
          setPerformanceMode('medium');
        }
        
        frameTimeRef.current = []; // Reset
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    checkPerformance();
  }, []);
  
  const intensity = performanceMode === 'auto' ? 'medium' : performanceMode;
  
  return (
    <>
      <ParticleSystem intensity={intensity} {...props} />
      {children}
    </>
  );
};

export default ParticleSystem;