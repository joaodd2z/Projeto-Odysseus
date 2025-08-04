import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { playHoverSound, playClickSound } from '../utils/soundSystem';
import SkillNode from './SkillNode';
import SkillModal from './SkillModal';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Map,
  Grid3X3,
  List,
  Eye,
  EyeOff
} from 'lucide-react';

const SkillTreeVisualization = ({ skillTree, onSkillSelect }) => {
  const { soundEnabled, userProgress } = useAppStore();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'grid', 'list'
  const [filters, setFilters] = useState({
    difficulty: 'all',
    status: 'all',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnections, setShowConnections] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Calculate skill positions based on tree structure
  const calculatePositions = useCallback((skills) => {
    if (!skills || skills.length === 0) return {};
    
    const positions = {};
    const levels = {};
    const visited = new Set();
    
    // Group skills by level (based on prerequisites)
    const calculateLevel = (skill, currentLevel = 0) => {
      if (visited.has(skill.id)) return levels[skill.id] || 0;
      
      visited.add(skill.id);
      
      if (!skill.prerequisites || skill.prerequisites.length === 0) {
        levels[skill.id] = 0;
        return 0;
      }
      
      let maxPrereqLevel = -1;
      skill.prerequisites.forEach(prereqId => {
        const prereqSkill = skills.find(s => s.id === prereqId);
        if (prereqSkill) {
          const prereqLevel = calculateLevel(prereqSkill, currentLevel + 1);
          maxPrereqLevel = Math.max(maxPrereqLevel, prereqLevel);
        }
      });
      
      levels[skill.id] = maxPrereqLevel + 1;
      return levels[skill.id];
    };
    
    // Calculate levels for all skills
    skills.forEach(skill => calculateLevel(skill));
    
    // Group skills by level
    const skillsByLevel = {};
    Object.entries(levels).forEach(([skillId, level]) => {
      if (!skillsByLevel[level]) skillsByLevel[level] = [];
      skillsByLevel[level].push(skillId);
    });
    
    // Position skills
    const levelHeight = 20; // Percentage of container height per level
    const maxLevel = Math.max(...Object.values(levels));
    
    Object.entries(skillsByLevel).forEach(([level, skillIds]) => {
      const levelNum = parseInt(level);
      const y = 10 + (levelNum * levelHeight);
      const skillsInLevel = skillIds.length;
      
      skillIds.forEach((skillId, index) => {
        const x = skillsInLevel === 1 ? 50 : 
                 10 + (index * (80 / Math.max(1, skillsInLevel - 1)));
        
        positions[skillId] = { x, y };
      });
    });
    
    return positions;
  }, []);
  
  // Calculate connections between skills
  const calculateConnections = useCallback((skills, positions) => {
    const connections = {};
    
    skills.forEach(skill => {
      if (skill.prerequisites && skill.prerequisites.length > 0) {
        connections[skill.id] = skill.prerequisites.map(prereqId => {
          const skillPos = positions[skill.id];
          const prereqPos = positions[prereqId];
          
          if (skillPos && prereqPos) {
            return {
              from: prereqId,
              to: skill.id,
              dx: skillPos.x - prereqPos.x,
              dy: skillPos.y - prereqPos.y
            };
          }
          return null;
        }).filter(Boolean);
      }
    });
    
    return connections;
  }, []);
  
  // Filter skills based on current filters and search
  const filteredSkills = skillTree?.skills?.filter(skill => {
    // Search filter
    if (searchTerm && !skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !skill.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Difficulty filter
    if (filters.difficulty !== 'all' && skill.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Status filter
    const isCompleted = userProgress?.completedSkills?.includes(skill.id);
    const isAvailable = skill.available || skill.prerequisites?.every(prereq => 
      userProgress?.completedSkills?.includes(prereq)
    ) || skill.prerequisites?.length === 0;
    
    if (filters.status === 'completed' && !isCompleted) return false;
    if (filters.status === 'available' && (!isAvailable || isCompleted)) return false;
    if (filters.status === 'locked' && isAvailable) return false;
    
    // Category filter
    if (filters.category !== 'all' && skill.category !== filters.category) {
      return false;
    }
    
    return true;
  }) || [];
  
  const positions = calculatePositions(filteredSkills);
  const connections = calculateConnections(filteredSkills, positions);
  
  // Handle skill selection
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
    if (onSkillSelect) onSkillSelect(skill);
  };
  
  // Zoom and pan handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
    if (soundEnabled) playClickSound();
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
    if (soundEnabled) playClickSound();
  };
  
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (soundEnabled) playClickSound();
  };
  
  const handleMouseDown = (e) => {
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetView();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFullscreen(prev => !prev);
          break;
        case 'Escape':
          if (isModalOpen) {
            setIsModalOpen(false);
            setSelectedSkill(null);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);
  
  // Mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, pan]);
  
  if (!skillTree || !skillTree.skills || skillTree.skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-light/60">
        <div className="text-center">
          <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma árvore de habilidades carregada</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-40 bg-dark' : 'h-full'}`}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-30 flex flex-col space-y-2">
        {/* Search */}
        <div className="glass-card p-2 border border-primary/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light/60" />
            <input
              type="text"
              placeholder="Buscar habilidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-dark/50 border border-primary/20 rounded-lg text-light placeholder-light/40 focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="glass-card p-3 border border-primary/20">
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-light/60" />
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="bg-dark/50 border border-primary/20 rounded px-2 py-1 text-sm text-light"
            >
              <option value="all">Todas Dificuldades</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
              <option value="expert">Especialista</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-dark/50 border border-primary/20 rounded px-2 py-1 text-sm text-light"
            >
              <option value="all">Todos Status</option>
              <option value="available">Disponível</option>
              <option value="completed">Concluída</option>
              <option value="locked">Bloqueada</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* View Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="glass-card p-2 border border-primary/20">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              title="Diminuir Zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-light/60 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              title="Aumentar Zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleResetView}
              className="p-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              title="Resetar Visualização (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* View Mode Controls */}
        <div className="glass-card p-2 border border-primary/20">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`p-2 rounded transition-colors ${
                showConnections ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'
              }`}
              title="Mostrar/Ocultar Conexões"
            >
              {showConnections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              title="Tela Cheia (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Skill Tree Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          height: isFullscreen ? '100vh' : '600px'
        }}
      >
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        />
        
        {/* SVG for Connections */}
        {showConnections && (
          <svg
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            {Object.entries(connections).map(([skillId, skillConnections]) => 
              skillConnections.map((connection, index) => {
                const fromPos = positions[connection.from];
                const toPos = positions[connection.to];
                
                if (!fromPos || !toPos) return null;
                
                const isCompleted = userProgress?.completedSkills?.includes(connection.from);
                const isAvailable = userProgress?.completedSkills?.includes(connection.from) ||
                                  filteredSkills.find(s => s.id === connection.to)?.available;
                
                return (
                  <line
                    key={`${skillId}-${index}`}
                    x1={`${fromPos.x}%`}
                    y1={`${fromPos.y}%`}
                    x2={`${toPos.x}%`}
                    y2={`${toPos.y}%`}
                    stroke={isCompleted ? '#10b981' : isAvailable ? '#3b82f6' : '#6b7280'}
                    strokeWidth="2"
                    strokeDasharray={!isAvailable ? '5,5' : 'none'}
                    className="transition-all duration-300"
                  />
                );
              })
            )}
          </svg>
        )}
        
        {/* Skills Container */}
        <div
          className="relative w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {filteredSkills.map(skill => {
            const position = positions[skill.id];
            if (!position) return null;
            
            return (
              <SkillNode
                key={skill.id}
                skill={skill}
                position={position}
                onSelect={handleSkillSelect}
                isSelected={selectedSkill?.id === skill.id}
                connections={connections[skill.id] || []}
              />
            );
          })}
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="glass-card px-4 py-2 border border-primary/20">
          <div className="flex items-center space-x-6 text-sm text-light/60">
            <span>Total: {filteredSkills.length}</span>
            <span>Concluídas: {filteredSkills.filter(s => userProgress?.completedSkills?.includes(s.id)).length}</span>
            <span>Disponíveis: {filteredSkills.filter(s => {
              const isCompleted = userProgress?.completedSkills?.includes(s.id);
              const isAvailable = s.available || s.prerequisites?.every(prereq => 
                userProgress?.completedSkills?.includes(prereq)
              ) || s.prerequisites?.length === 0;
              return isAvailable && !isCompleted;
            }).length}</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>
      
      {/* Skill Modal */}
      <SkillModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSkill(null);
        }}
      />
      
      {/* Keyboard Shortcuts Help */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 z-30">
          <div className="glass-card p-3 border border-primary/20 text-xs text-light/60">
            <div className="space-y-1">
              <div><kbd className="bg-primary/20 px-1 rounded">+/-</kbd> Zoom</div>
              <div><kbd className="bg-primary/20 px-1 rounded">0</kbd> Reset</div>
              <div><kbd className="bg-primary/20 px-1 rounded">F</kbd> Tela Cheia</div>
              <div><kbd className="bg-primary/20 px-1 rounded">Esc</kbd> Fechar</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeVisualization;