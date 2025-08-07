// 🧠 useToolsLayer Hook - Odysseus Tools Layer
// Hook personalizado para gerenciar estado e lógica do Tools Layer

import { useState, useEffect, useMemo, useCallback } from 'react';
import aiToolsService from '../services/aiToolsService';
import { createLogger } from '../utils/logger';
import { trackEvent } from '../utils/metrics';

const logger = createLogger('useToolsLayer');

export const useToolsLayer = (initialConfig = {}) => {
  logger.info('useToolsLayer hook inicializado');
  
  // Estados principais
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    resultado: [],
    tipo: [],
    complexidade: []
  });
  const [visibleTools, setVisibleTools] = useState(initialConfig.initialVisible || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Log do estado inicial e aguardar carregamento do aiToolsService
  useEffect(() => {
    logger.info('useToolsLayer - Estado inicial:', {
      isOpen,
      searchTerm,
      filters,
      visibleTools,
      loading,
      error
    });
    
    // Aguardar carregamento do aiToolsService
    const checkServiceLoaded = () => {
      logger.info('Verificando se aiToolsService está carregado:', aiToolsService.isLoaded);
      if (aiToolsService.isLoaded) {
        logger.info('aiToolsService carregado com sucesso, total de ferramentas:', aiToolsService.tools.length);
      } else {
        logger.warn('aiToolsService ainda não carregado, tentando novamente em 1s');
        setTimeout(checkServiceLoaded, 1000);
      }
    };
    
    checkServiceLoaded();
  }, []);

  // Opções de filtro
  const filterOptions = {
    resultado: ['Texto', 'Imagem', 'Vídeo', 'Voz', 'Código', 'Automação', 'PDF'],
    tipo: ['Gratuito', 'Freemium', 'Pago'],
    complexidade: ['Simples', 'Avançado']
  };

  // Estado para ferramentas filtradas
  const [filteredTools, setFilteredTools] = useState([]);
  
  // Buscar ferramentas filtradas
  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Iniciando busca com:', { filters, searchTerm });
        
        const results = await aiToolsService.searchTools(filters, searchTerm);
        
        console.log('✅ Resultados da busca:', results?.length || 0, 'ferramentas');
        
        // Sempre definir resultados (array vazio se necessário)
        setFilteredTools(Array.isArray(results) ? results : []);
        
      } catch (error) {
        console.error('❌ Erro na busca:', error);
        setError('Erro ao buscar ferramentas');
        // Em caso de erro, tentar obter dados de fallback
        try {
          const fallbackResults = await aiToolsService.getAllTools();
          setFilteredTools(Array.isArray(fallbackResults) ? fallbackResults : []);
        } catch (fallbackError) {
          setFilteredTools([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [filters, searchTerm]);

  // Estatísticas das ferramentas
  const stats = useMemo(() => {
    return aiToolsService.getStats();
  }, []);

  // Abrir modal
  const openModal = useCallback(() => {
    setIsOpen(true);
    trackEvent('tools_layer_opened', {
      timestamp: Date.now(),
      searchTerm: searchTerm || 'empty'
    });
    logger.info('Tools Layer modal aberto');
  }, [searchTerm]);

  // Fechar modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    trackEvent('tools_layer_closed', {
      timestamp: Date.now(),
      searchTerm,
      resultsCount: filteredTools.length,
      visibleTools
    });
    logger.info('Tools Layer modal fechado');
  }, [searchTerm, filteredTools.length, visibleTools]);

  // Atualizar termo de busca
  const updateSearchTerm = useCallback((term) => {
    logger.info('updateSearchTerm chamado com:', term);
    setSearchTerm(term);
    setVisibleTools(initialConfig.initialVisible || 10);
    
    // Track search event
    if (term) {
      trackEvent('tools_search', {
        search_term: term,
        timestamp: Date.now()
      });
    }
  }, [initialConfig.initialVisible]);

  // Alternar filtro
  const toggleFilter = useCallback((category, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      };
      
      trackEvent('tools_filter_changed', {
        category,
        value,
        action: prev[category].includes(value) ? 'removed' : 'added',
        timestamp: Date.now()
      });
      
      return newFilters;
    });
    
    setVisibleTools(initialConfig.initialVisible || 10); // Reset visible tools
  }, [initialConfig.initialVisible]);

  // Limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    setFilters({
      resultado: [],
      tipo: [],
      complexidade: []
    });
    setSearchTerm('');
    setVisibleTools(initialConfig.initialVisible || 10);
    
    trackEvent('tools_filters_cleared', {
      timestamp: Date.now()
    });
    
    logger.info('Todos os filtros limpos');
  }, [initialConfig.initialVisible]);

  // Carregar mais ferramentas
  const loadMoreTools = useCallback(() => {
    const increment = initialConfig.loadIncrement || 10;
    setVisibleTools(prev => prev + increment);
    
    trackEvent('tools_load_more', {
      previousVisible: visibleTools,
      newVisible: visibleTools + increment,
      totalAvailable: filteredTools.length,
      timestamp: Date.now()
    });
  }, [initialConfig.loadIncrement, visibleTools, filteredTools.length]);

  // Acessar ferramenta (tracking)
  const accessTool = useCallback((tool) => {
    trackEvent('tool_accessed', {
      toolId: tool.id,
      toolName: tool.nome,
      toolType: tool.tipo,
      toolResult: tool.resultado,
      searchTerm,
      timestamp: Date.now()
    });
    
    logger.info(`Ferramenta acessada: ${tool.nome}`);
  }, [searchTerm]);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(arr => arr.length > 0) || searchTerm.length > 0;
  }, [filters, searchTerm]);

  // Verificar se pode carregar mais
  const canLoadMore = useMemo(() => {
    return visibleTools < filteredTools.length;
  }, [visibleTools, filteredTools.length]);

  // Ferramentas visíveis
  const visibleToolsList = useMemo(() => {
    return filteredTools.slice(0, visibleTools);
  }, [filteredTools, visibleTools]);

  // Efeito para resetar erro quando filtros mudam
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [searchTerm, filters]);

  // Inicializar dados
  useEffect(() => {
    setLoading(true);
    
    const checkLoading = () => {
      if (aiToolsService.isLoaded) {
        setLoading(false);
      } else {
        setTimeout(checkLoading, 100);
      }
    };
    
    checkLoading();
  }, []);

  // Efeito para log de estatísticas quando modal abre
  useEffect(() => {
    if (isOpen) {
      logger.info('Estatísticas do Tools Layer:', {
        totalTools: stats.total,
        filteredCount: filteredTools.length,
        activeFilters: hasActiveFilters,
        searchTerm
      });
    }
  }, [isOpen, stats.total, filteredTools.length, hasActiveFilters, searchTerm]);

  return {
    // Estados
    isOpen,
    searchTerm,
    filters,
    visibleTools,
    loading,
    error,
    
    // Dados
    filteredTools,
    visibleToolsList,
    stats,
    filterOptions,
    
    // Flags
    hasActiveFilters,
    canLoadMore,
    
    // Ações
    openModal,
    closeModal,
    updateSearchTerm,
    toggleFilter,
    clearAllFilters,
    loadMoreTools,
    accessTool,
    
    // Utilitários
    remainingTools: filteredTools.length - visibleTools
  };
};

export default useToolsLayer;