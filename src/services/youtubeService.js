// 🎥 YouTube Service - Project Odysseus
// Integração com YouTube API para vídeos educacionais gratuitos

import { createLogger } from '../utils/logger.js';
import { handleError, NetworkError, APIError } from '../utils/errorHandler.js';
import { trackAPICall } from '../utils/metrics.js';

const logger = createLogger('YouTubeService');

// 🔑 Configuração da API do YouTube
const YOUTUBE_API_CONFIG = {
  baseURL: 'https://www.googleapis.com/youtube/v3',
  key: import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyDummy_Key_For_Development',
  maxResults: 10,
  order: 'relevance',
  type: 'video',
  videoDefinition: 'any',
  videoDuration: 'any',
  videoLicense: 'any'
};

// 🎯 Palavras-chave para melhorar a busca por área
const SEARCH_KEYWORDS = {
  'tecnologia': ['tutorial', 'curso', 'programação', 'desenvolvimento', 'código'],
  'medicina': ['aula', 'medicina', 'anatomia', 'fisiologia', 'curso médico'],
  'direito': ['direito', 'lei', 'jurídico', 'advocacia', 'curso'],
  'design': ['design', 'tutorial', 'photoshop', 'illustrator', 'criativo'],
  'marketing': ['marketing', 'digital', 'estratégia', 'curso', 'negócios'],
  'educacao': ['pedagogia', 'educação', 'ensino', 'didática', 'curso'],
  'saude': ['saúde', 'enfermagem', 'fisioterapia', 'nutrição', 'curso'],
  'engenharia': ['engenharia', 'cálculo', 'estrutural', 'projeto', 'curso'],
  'artes': ['arte', 'música', 'teatro', 'criativo', 'curso'],
  'ciencias': ['ciência', 'física', 'química', 'matemática', 'curso'],
  'humanas': ['história', 'geografia', 'sociologia', 'filosofia', 'curso'],
  'teologia': ['teologia', 'bíblia', 'religião', 'espiritual', 'curso'],
  'default': ['curso', 'tutorial', 'aula', 'aprenda', 'como fazer']
};

// 🔍 Função para detectar categoria da habilidade
const detectSkillCategory = (skillName, careerKey) => {
  const skill = skillName.toLowerCase();
  const career = careerKey.toLowerCase();
  
  if (career.includes('desenvolvedor') || career.includes('programação') || career.includes('software')) {
    return 'tecnologia';
  }
  if (career.includes('medicina') || career.includes('medico')) {
    return 'medicina';
  }
  if (career.includes('direito') || career.includes('juridico')) {
    return 'direito';
  }
  if (career.includes('design') || career.includes('grafico')) {
    return 'design';
  }
  if (career.includes('marketing') || career.includes('trafego') || career.includes('social')) {
    return 'marketing';
  }
  if (career.includes('pedagogia') || career.includes('educacao')) {
    return 'educacao';
  }
  if (career.includes('enfermagem') || career.includes('fisioterapia') || career.includes('nutricao')) {
    return 'saude';
  }
  if (career.includes('engenharia') || career.includes('arquitetura')) {
    return 'engenharia';
  }
  if (career.includes('musica') || career.includes('teatro') || career.includes('arte')) {
    return 'artes';
  }
  if (career.includes('fisica') || career.includes('quimica') || career.includes('matematica')) {
    return 'ciencias';
  }
  if (career.includes('historia') || career.includes('geografia') || career.includes('sociologia')) {
    return 'humanas';
  }
  if (career.includes('teologia') || career.includes('religiao') || career.includes('filosofia')) {
    return 'teologia';
  }
  
  return 'default';
};

// 🎥 Classe principal do serviço YouTube
class YouTubeService {
  constructor() {
    this.cache = new Map();
    this.rateLimitDelay = 100; // ms entre requisições
    this.lastRequestTime = 0;
  }

  // 🔄 Rate limiting para evitar excesso de requisições
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  // 🔍 Buscar vídeos por habilidade
  async searchVideosForSkill(skillName, careerKey = '', options = {}) {
    const startTime = performance.now();
    
    try {
      // Verificar se a API key está configurada
      if (!YOUTUBE_API_CONFIG.key || YOUTUBE_API_CONFIG.key === 'AIzaSyDummy_Key_For_Development') {
        logger.warn('YouTube API key não configurada, retornando lista vazia', { skillName });
        return [];
      }
      
      // Verificar cache primeiro
      const cacheKey = `${skillName}-${careerKey}`;
      if (this.cache.has(cacheKey)) {
        logger.info('Retornando vídeos do cache', { skillName, careerKey });
        return this.cache.get(cacheKey);
      }

      await this.waitForRateLimit();

      // Detectar categoria e construir query otimizada
      const category = detectSkillCategory(skillName, careerKey);
      const keywords = SEARCH_KEYWORDS[category] || SEARCH_KEYWORDS.default;
      
      // Construir query de busca inteligente
      const searchQuery = this.buildSearchQuery(skillName, keywords, options);
      
      logger.info('Buscando vídeos no YouTube', { 
        skillName, 
        careerKey, 
        category, 
        searchQuery 
      });

      // Fazer requisição para YouTube API
      const videos = await this.fetchVideosFromAPI(searchQuery, options);
      
      // Filtrar e processar resultados
      const processedVideos = this.processVideoResults(videos, skillName);
      
      // Armazenar no cache
      this.cache.set(cacheKey, processedVideos);
      
      // Métricas
      trackAPICall('youtube_search', 'GET', 0, 200, {
        duration: performance.now() - startTime,
        skillName,
        resultCount: processedVideos.length,
        category
      });
      
      logger.info('Vídeos encontrados com sucesso', { 
        count: processedVideos.length,
        skillName 
      });
      
      return processedVideos;
      
    } catch (error) {
      const enhancedError = new APIError(
        `Falha ao buscar vídeos para ${skillName}`,
        'youtube',
        skillName,
        error.message
      );
      
      handleError(enhancedError, {
        skillName,
        careerKey,
        duration: performance.now() - startTime
      });
      
      // Retornar vídeos padrão em caso de erro
      return this.getFallbackVideos(skillName, careerKey);
    }
  }

  // 🔨 Construir query de busca otimizada
  buildSearchQuery(skillName, keywords, options = {}) {
    const baseQuery = skillName;
    const additionalKeywords = keywords.slice(0, 2); // Limitar para não sobrecarregar
    
    // Adicionar filtros de qualidade
    const qualityFilters = [
      'curso completo',
      'tutorial',
      'aula',
      'grátis',
      'português OR english'
    ];
    
    // Construir query final
    const queryParts = [
      baseQuery,
      ...additionalKeywords,
      ...qualityFilters.slice(0, 2)
    ];
    
    return queryParts.join(' ');
  }

  // 🌐 Fazer requisição para YouTube API
  async fetchVideosFromAPI(searchQuery, options = {}) {
    const params = new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      key: YOUTUBE_API_CONFIG.key,
      type: YOUTUBE_API_CONFIG.type,
      order: options.order || YOUTUBE_API_CONFIG.order,
      maxResults: options.maxResults || YOUTUBE_API_CONFIG.maxResults,
      videoDefinition: YOUTUBE_API_CONFIG.videoDefinition,
      videoDuration: options.duration || YOUTUBE_API_CONFIG.videoDuration,
      regionCode: 'BR', // Priorizar conteúdo brasileiro
      relevanceLanguage: 'pt'
    });

    const url = `${YOUTUBE_API_CONFIG.baseURL}/search?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new NetworkError(
        `YouTube API retornou status ${response.status}`,
        response.status,
        url
      );
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new APIError(
        'Erro na YouTube API',
        'youtube',
        searchQuery,
        data.error.message
      );
    }
    
    return data.items || [];
  }

  // 🔄 Processar resultados dos vídeos
  processVideoResults(videos, skillName) {
    return videos
      .filter(video => this.isValidVideo(video, skillName))
      .map(video => ({
        id: video.id.videoId,
        title: this.cleanVideoTitle(video.snippet.title),
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
        relevanceScore: this.calculateRelevanceScore(video, skillName)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Limitar a 5 vídeos mais relevantes
  }

  // ✅ Validar se o vídeo é adequado
  isValidVideo(video, skillName) {
    if (!video.id?.videoId || !video.snippet?.title) {
      return false;
    }
    
    const title = video.snippet.title.toLowerCase();
    const description = video.snippet.description?.toLowerCase() || '';
    const skillLower = skillName.toLowerCase();
    
    // Filtros de qualidade
    const hasRelevantContent = 
      title.includes(skillLower) ||
      description.includes(skillLower) ||
      title.includes('curso') ||
      title.includes('tutorial') ||
      title.includes('aula');
    
    // Filtros negativos (evitar conteúdo inadequado)
    const hasNegativeContent = 
      title.includes('clickbait') ||
      title.includes('fake') ||
      title.includes('scam') ||
      title.includes('18+');
    
    return hasRelevantContent && !hasNegativeContent;
  }

  // 🧹 Limpar título do vídeo
  cleanVideoTitle(title) {
    return title
      .replace(/[\[\](){}]/g, '') // Remover colchetes e parênteses
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim()
      .substring(0, 100); // Limitar tamanho
  }

  // 📊 Calcular score de relevância
  calculateRelevanceScore(video, skillName) {
    let score = 0;
    const title = video.snippet.title.toLowerCase();
    const description = video.snippet.description?.toLowerCase() || '';
    const skillLower = skillName.toLowerCase();
    
    // Pontuação por relevância do título
    if (title.includes(skillLower)) score += 10;
    if (title.includes('curso')) score += 8;
    if (title.includes('tutorial')) score += 6;
    if (title.includes('aula')) score += 5;
    if (title.includes('completo')) score += 4;
    if (title.includes('grátis') || title.includes('free')) score += 3;
    
    // Pontuação por relevância da descrição
    if (description.includes(skillLower)) score += 5;
    if (description.includes('curso')) score += 3;
    
    // Penalizar vídeos muito antigos (mais de 3 anos)
    const publishDate = new Date(video.snippet.publishedAt);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    if (publishDate < threeYearsAgo) {
      score -= 2;
    }
    
    return Math.max(0, score);
  }

  // 🆘 Vídeos de fallback em caso de erro
  getFallbackVideos(skillName, careerKey) {
    logger.warn('Usando vídeos de fallback', { skillName, careerKey });
    
    // Vídeos genéricos de alta qualidade por categoria
    const fallbackVideos = {
      'tecnologia': [
        {
          id: 'fallback-tech-1',
          title: `Curso de ${skillName} - Fundamentos`,
          description: 'Curso completo e gratuito',
          url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(skillName + ' curso'),
          thumbnail: '/placeholder-video.jpg',
          channelTitle: 'Canal Educativo',
          relevanceScore: 5
        }
      ],
      'default': [
        {
          id: 'fallback-default-1',
          title: `Aprenda ${skillName}`,
          description: 'Conteúdo educativo gratuito',
          url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(skillName),
          thumbnail: '/placeholder-video.jpg',
          channelTitle: 'Educação Online',
          relevanceScore: 3
        }
      ]
    };
    
    const category = detectSkillCategory(skillName, careerKey);
    return fallbackVideos[category] || fallbackVideos.default;
  }

  // 🔍 Buscar playlists educacionais
  async searchPlaylistsForSkill(skillName, careerKey = '') {
    try {
      // Verificar se a API key está configurada
      if (!YOUTUBE_API_CONFIG.key || YOUTUBE_API_CONFIG.key === 'AIzaSyDummy_Key_For_Development') {
        logger.warn('YouTube API key não configurada, retornando lista vazia', { skillName });
        return [];
      }
      
      const searchQuery = `${skillName} playlist curso completo`;
      
      const params = new URLSearchParams({
        part: 'snippet',
        q: searchQuery,
        key: YOUTUBE_API_CONFIG.key,
        type: 'playlist',
        order: 'relevance',
        maxResults: 5,
        regionCode: 'BR'
      });

      const url = `${YOUTUBE_API_CONFIG.baseURL}/search?${params}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      return (data.items || []).map(playlist => ({
        id: playlist.id.playlistId,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        thumbnail: playlist.snippet.thumbnails.medium?.url,
        channelTitle: playlist.snippet.channelTitle,
        url: `https://www.youtube.com/playlist?list=${playlist.id.playlistId}`,
        type: 'playlist'
      }));
      
    } catch (error) {
      logger.error('Erro ao buscar playlists', { error: error.message, skillName });
      return [];
    }
  }

  // 🧹 Limpar cache
  clearCache() {
    this.cache.clear();
    logger.info('Cache do YouTube limpo');
  }

  // 📊 Estatísticas do cache
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 🎯 Instância singleton
const youtubeService = new YouTubeService();

// 🔧 Funções utilitárias exportadas
export const searchVideosForSkill = (skillName, careerKey, options) => 
  youtubeService.searchVideosForSkill(skillName, careerKey, options);

export const searchPlaylistsForSkill = (skillName, careerKey) => 
  youtubeService.searchPlaylistsForSkill(skillName, careerKey);

export const clearYouTubeCache = () => youtubeService.clearCache();

export const getYouTubeCacheStats = () => youtubeService.getCacheStats();

// 🎥 Função principal para buscar conteúdo educacional completo
export const getEducationalContent = async (skillName, careerKey = '') => {
  try {
    const [videos, playlists] = await Promise.allSettled([
      searchVideosForSkill(skillName, careerKey),
      searchPlaylistsForSkill(skillName, careerKey)
    ]);
    
    return {
      videos: videos.status === 'fulfilled' ? videos.value : [],
      playlists: playlists.status === 'fulfilled' ? playlists.value : [],
      skillName,
      careerKey,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Erro ao buscar conteúdo educacional', { 
      error: error.message, 
      skillName, 
      careerKey 
    });
    
    return {
      videos: [],
      playlists: [],
      skillName,
      careerKey,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default youtubeService;