import React, { useEffect } from 'react';
import { X, Search, ExternalLink, Sparkles, Brain } from 'lucide-react';
import ParticleSystem from '../ui/ParticleSystem';
import { useToolsLayer } from '../../hooks/useToolsLayer';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ToolsLayerModal');

const ToolsLayerModal = ({ isOpen, onClose }) => {
  const {
    searchTerm,
    filters,
    filteredTools,
    visibleToolsList,
    filterOptions,
    hasActiveFilters,
    canLoadMore,
    remainingTools,
    loading,
    error,
    updateSearchTerm,
    toggleFilter,
    clearAllFilters,
    loadMoreTools,
    accessTool
  } = useToolsLayer({ initialVisible: 10, loadIncrement: 10 });

  // Debug logs
  useEffect(() => {
    logger.info('ToolsLayerModal - Estado atual:', {
      isOpen,
      searchTerm,
      filteredToolsCount: filteredTools?.length || 0,
      visibleToolsListCount: visibleToolsList?.length || 0,
      hasActiveFilters,
      canLoadMore,
      remainingTools
    });
  }, [isOpen, searchTerm, filteredTools, visibleToolsList, hasActiveFilters, canLoadMore, remainingTools]);

  // Log quando updateSearchTerm é chamado
  const handleSearchChange = (e) => {
    const value = e.target.value;
    logger.info('ToolsLayerModal - Mudança na busca:', value);
    updateSearchTerm(value);
  };

  // Função para obter ícone do tipo
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Gratuito':
        return '✅';
      case 'Freemium':
        return '🔄';
      case 'Pago':
        return '💰';
      default:
        return '🔧';
    }
  };

  // Função para obter ícone do resultado
  const getResultadoIcon = (resultado) => {
    switch (resultado) {
      case 'Texto':
        return '📝';
      case 'Imagem':
        return '🖼️';
      case 'Vídeo':
        return '🎬';
      case 'Voz':
        return '🎤';
      case 'Código':
        return '💻';
      case 'Automação':
        return '⚡';
      case 'PDF':
        return '📄';
      default:
        return '🔧';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-dark-900/95 backdrop-blur-md border border-primary-500/30 rounded-2xl overflow-hidden">
        {/* Partículas de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <ParticleSystem 
            enabled={true}
            intensity="low"
            colorScheme="primary"
            style={{ opacity: 0.3 }}
          />
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-primary-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-primary-500" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🧠 Odysseus Tools Layer
                </h2>
                <p className="text-text-secondary text-sm">
                  Ferramentas de IA — organizadas pelo que você precisa, não pelo hype.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Barra de busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="O que você quer fazer com IA?"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  logger.info('Enter pressionado na busca');
                  // A busca já é realizada automaticamente pelo updateSearchTerm
                  // Apenas garantimos que o Enter não cause comportamentos indesejados
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-primary-500/30 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Filtros */}
          <div className="space-y-4">
            {Object.entries(filterOptions).map(([category, options]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-text-secondary capitalize">
                  {category === 'resultado' ? 'Resultado Desejado' : 
                   category === 'tipo' ? 'Modelo de Preço' : 'Complexidade'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {options.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(category, option)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filters[category].includes(option)
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : 'bg-dark-800/50 text-text-secondary hover:bg-dark-700/50 hover:text-white border border-primary-500/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Botão limpar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-accent-500 hover:text-accent-400 transition-colors"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-secondary">Carregando ferramentas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-error-400 text-xl">⚠️</span>
              </div>
              <p className="text-error-400 mb-2">Erro ao carregar ferramentas</p>
              <p className="text-text-secondary text-sm">{error}</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">
                Nenhuma ferramenta encontrada com esses filtros.
              </p>
            </div>
          ) : (
            <>
              {/* Grid de ferramentas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {visibleToolsList.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="group bg-dark-800/30 backdrop-blur-sm border border-primary-500/20 rounded-xl p-6 hover:border-primary-500/50 hover:bg-dark-800/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                        {tool.nome}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{getTipoIcon(tool.tipo)}</span>
                        <span className="text-lg">{getResultadoIcon(tool.resultado)}</span>
                      </div>
                    </div>
                    
                    <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                      {tool.descricao}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-text-secondary">
                        <span className="font-medium">Tipo:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full ${
                          tool.tipo === 'Gratuito' ? 'bg-success-500/20 text-success-400' :
                          tool.tipo === 'Freemium' ? 'bg-warning-500/20 text-warning-400' :
                          'bg-error-500/20 text-error-400'
                        }`}>
                          {tool.tipo}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-text-secondary">
                        <span className="font-medium">Resultado:</span>
                        <span className="ml-2 px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full">
                          {tool.resultado}
                        </span>
                      </div>
                    </div>
                    
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => accessTool(tool)}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 group"
                    >
                      <span>Usar Agora</span>
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Botão carregar mais */}
              {canLoadMore && (
                <div className="text-center">
                  <button
                    onClick={loadMoreTools}
                    className="px-6 py-3 bg-dark-800/50 hover:bg-dark-700/50 text-white border border-primary-500/30 hover:border-primary-500/50 rounded-lg transition-all duration-200 hover:shadow-lg"
                  >
                    Carregar mais ({remainingTools} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ToolsLayerModal;