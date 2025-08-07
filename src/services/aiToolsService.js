// 🧠 AI Tools Service - Odysseus Tools Layer
// Serviço para gerenciamento de ferramentas de IA

import { createLogger } from '../utils/logger.js';

const logger = createLogger('AIToolsService');

class AIToolsService {
  constructor() {
    this.tools = [];
    this.cache = new Map();
    this.lastUpdate = Date.now();
    this.isLoaded = false;
    this.loadingPromise = null;
    this.initializationAttempts = 0;
    this.maxInitializationAttempts = 3;
    
    // Carregar dados de fallback imediatamente
    this.tools = this.getFallbackData();
    this.isLoaded = true;
    
    // Tentar carregar dados reais em background
    this.initializeService();
  }

  /**
   * Inicializa o serviço de forma assíncrona
   */
  initializeService() {
    this.loadingPromise = this.loadRealData().catch(error => {
      logger.error('Erro ao carregar dados reais, mantendo fallback:', error);
    });
  }

  /**
   * Tenta carregar dados reais do JSON em background
   */
  async loadRealData() {
    this.initializationAttempts++;
    
    try {
      logger.info(`Tentativa ${this.initializationAttempts} de carregar dados reais...`);
      const response = await fetch('/aiToolsDatabase.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Dados carregados não são um array válido ou estão vazios');
      }
      
      // Substituir dados de fallback pelos dados reais
      this.tools = data;
      this.clearCache(); // Limpar cache para forçar nova busca
      logger.info('Dados reais carregados com sucesso!', { count: this.tools.length });
      
    } catch (error) {
      logger.warn(`Falha na tentativa ${this.initializationAttempts}:`, error.message);
      
      // Tentar novamente se não excedeu o limite
      if (this.initializationAttempts < this.maxInitializationAttempts) {
        setTimeout(() => this.loadRealData(), 2000 * this.initializationAttempts);
      } else {
        logger.info('Máximo de tentativas atingido, mantendo dados de fallback');
      }
    }
  }

  /**
   * Garante que as ferramentas estejam disponíveis (sempre retorna true)
   */
  async ensureLoaded() {
    // Sempre temos dados disponíveis (fallback ou reais)
    return true;
  }



  /**
   * Dados de fallback caso o JSON não carregue
   */
  getFallbackData() {
    logger.info('Usando dados de fallback');
    return [
      // === ASSISTENTES CONVERSACIONAIS ===
      {
        id: 1,
        nome: "🤖 ChatGPT",
        descricao: "Assistente de IA conversacional avançado da OpenAI para diversas tarefas",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://chat.openai.com",
        tags: ["texto", "conversação", "código", "análise", "popular"]
      },
      {
        id: 2,
        nome: "💎 Gemini",
        descricao: "IA do Google integrada com seus serviços, excelente para produtividade.",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://gemini.google.com",
        tags: ["google", "produtividade", "integração", "gratuito"]
      },
      {
        id: 3,
        nome: "🧠 Claude",
        descricao: "Assistente de IA da Anthropic, excelente para análise de documentos e conversas longas.",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://claude.ai",
        tags: ["texto", "análise", "documentos", "conversação"]
      },
      {
        id: 4,
        nome: "🔍 Perplexity",
        descricao: "Motor de busca com IA que fornece respostas precisas com fontes em tempo real.",
        categoria: "Pesquisa",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://perplexity.ai",
        tags: ["pesquisa", "busca", "fontes", "tempo real"]
      },
      {
        id: 5,
        nome: "✍️ Jasper AI",
        descricao: "Plataforma de escrita por IA para marketing e criação de conteúdo profissional.",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Pago",
        preco: "Pago",
        link: "https://jasper.ai",
        tags: ["marketing", "copywriting", "conteúdo", "blogs"]
      },
      {
        id: 6,
        nome: "📚 QuillBot",
        descricao: "Ferramenta de paráfrase e melhoria de escrita com IA.",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://quillbot.com",
        tags: ["paráfrase", "escrita", "gramática", "estilo"]
      },
      {
        id: 7,
        nome: "🔤 Grammarly",
        descricao: "Assistente de escrita com IA para correção gramatical e estilo.",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://grammarly.com",
        tags: ["gramática", "correção", "escrita", "estilo"]
      },
      {
        id: 8,
        nome: "🎯 Copy.ai",
        descricao: "IA especializada em copywriting e criação de conteúdo de marketing.",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://copy.ai",
        tags: ["copywriting", "marketing", "vendas", "conteúdo"]
      },

      // === GERAÇÃO DE IMAGEM ===
      {
        id: 9,
        nome: "🎨 DALL-E 3",
        descricao: "Gerador de imagens de IA da OpenAI integrado ao ChatGPT.",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://chat.openai.com",
        tags: ["imagem", "arte", "criativo", "openai"]
      },
      {
        id: 10,
        nome: "🖼️ Midjourney",
        descricao: "Plataforma líder em geração de arte digital e imagens por IA.",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Pago",
        preco: "Pago",
        link: "https://midjourney.com",
        tags: ["arte", "digital", "criatividade", "design"]
      },
      {
        id: 11,
        nome: "🎭 Stable Diffusion",
        descricao: "Modelo de IA open-source para geração de imagens de alta qualidade.",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://stability.ai/stable-diffusion",
        tags: ["open-source", "geração", "arte", "customização"]
      },
      {
        id: 12,
        nome: "🖌️ Adobe Firefly",
        descricao: "IA generativa da Adobe integrada aos produtos Creative Cloud.",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://firefly.adobe.com",
        tags: ["adobe", "design", "profissional", "integração"]
      },
      {
        id: 13,
        nome: "🎪 Leonardo AI",
        descricao: "Plataforma de criação de imagens com IA focada em arte e design.",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://leonardo.ai",
        tags: ["arte", "design", "criatividade", "modelos"]
      },
      {
        id: 14,
        nome: "🔧 Remove.bg",
        descricao: "IA especializada em remoção automática de fundos de imagens.",
        categoria: "Edição de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://remove.bg",
        tags: ["edição", "fundo", "automação", "processamento"]
      },
      {
        id: 15,
        nome: "🎨 Canva AI",
        descricao: "Ferramentas de IA integradas ao Canva para design gráfico.",
        categoria: "Design",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://canva.com/ai",
        tags: ["design", "templates", "marketing", "social"]
      },

      // === GERAÇÃO DE VÍDEO ===
      {
        id: 16,
        nome: "🎬 RunwayML",
        descricao: "Plataforma de IA para criação e edição de vídeos.",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://runwayml.com",
        tags: ["vídeo", "edição", "criativo", "runway"]
      },
      {
        id: 17,
        nome: "🎥 Pika Labs",
        descricao: "Gerador de vídeos curtos por IA a partir de texto e imagens.",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://pika.art",
        tags: ["geração", "texto-para-vídeo", "animação", "curtos"]
      },
      {
        id: 18,
        nome: "🎞️ Synthesia",
        descricao: "Criação de vídeos com avatares virtuais falando em múltiplos idiomas.",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Pago",
        preco: "Pago",
        link: "https://synthesia.io",
        tags: ["avatares", "apresentação", "multilíngue", "corporativo"]
      },
      {
        id: 19,
        nome: "✂️ Descript",
        descricao: "Editor de vídeo e áudio baseado em texto com IA avançada.",
        categoria: "Edição de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://descript.com",
        tags: ["edição", "transcrição", "áudio", "texto"]
      },
      {
        id: 20,
        nome: "🎭 HeyGen",
        descricao: "Plataforma para criar vídeos com avatares AI realistas.",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://heygen.com",
        tags: ["avatares", "realista", "apresentação", "marketing"]
      },

      // === GERAÇÃO DE ÁUDIO ===
      {
        id: 21,
        nome: "🎵 Suno AI",
        descricao: "Gerador de música com IA, crie músicas completas com letras e melodias.",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://suno.com",
        tags: ["música", "áudio", "criativo", "letras"]
      },
      {
        id: 22,
        nome: "🎵 Mubert",
        descricao: "Gerador de música por IA para diferentes estilos e humores.",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://mubert.com",
        tags: ["música", "geração", "trilha", "royalty-free"]
      },
      {
        id: 23,
        nome: "🎤 ElevenLabs",
        descricao: "IA de síntese de voz ultra-realista em múltiplos idiomas.",
        categoria: "Síntese de Voz",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://elevenlabs.io",
        tags: ["voz", "síntese", "realista", "multilíngue"]
      },
      {
        id: 24,
        nome: "🎼 AIVA",
        descricao: "Compositor de IA para música clássica e trilhas sonoras.",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://aiva.ai",
        tags: ["composição", "clássica", "trilha", "orquestral"]
      },
      {
        id: 25,
        nome: "🔊 Adobe Podcast",
        descricao: "IA para melhorar qualidade de áudio e remover ruídos.",
        categoria: "Edição de Áudio",
        resultado: "Áudio",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://podcast.adobe.com",
        tags: ["podcast", "limpeza", "qualidade", "ruído"]
      },

      // === PROGRAMAÇÃO ===
      {
        id: 26,
        nome: "💻 GitHub Copilot",
        descricao: "Assistente de programação por IA que sugere código em tempo real.",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Pago",
        preco: "Pago",
        link: "https://github.com/features/copilot",
        tags: ["programação", "autocompletar", "desenvolvimento", "github"]
      },
      {
        id: 27,
        nome: "🤖 Cursor",
        descricao: "Editor de código com IA integrada para programação assistida.",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://cursor.sh",
        tags: ["editor", "programação", "assistente", "desenvolvimento"]
      },
      {
        id: 28,
        nome: "⚡ Replit AI",
        descricao: "IA integrada ao Replit para programação colaborativa online.",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://replit.com/ai",
        tags: ["online", "colaborativo", "programação", "deploy"]
      },
      {
        id: 29,
        nome: "🛠️ Tabnine",
        descricao: "Assistente de código com IA para múltiplas linguagens de programação.",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://tabnine.com",
        tags: ["autocompletar", "multilinguagem", "produtividade", "IDE"]
      },

      // === PRODUTIVIDADE ===
      {
        id: 30,
        nome: "📝 Notion AI",
        descricao: "IA integrada ao Notion para produtividade e organização.",
        categoria: "Produtividade",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://notion.so",
        tags: ["produtividade", "organização", "texto", "notion"]
      },
      {
        id: 31,
        nome: "🗣️ Otter.ai",
        descricao: "Transcrição automática de reuniões e conversas com IA.",
        categoria: "Transcrição",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://otter.ai",
        tags: ["transcrição", "reuniões", "notas", "colaboração"]
      },
      {
        id: 32,
        nome: "📄 ChatPDF",
        descricao: "IA para conversar e extrair informações de documentos PDF.",
        categoria: "Análise de Documentos",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://chatpdf.com",
        tags: ["PDF", "análise", "extração", "documentos"]
      },
      {
        id: 33,
        nome: "💼 Tome",
        descricao: "IA para criação automática de apresentações profissionais.",
        categoria: "Apresentações",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://tome.app",
        tags: ["apresentações", "slides", "profissional", "automação"]
      },
      {
        id: 34,
        nome: "🌟 Gamma",
        descricao: "IA para criação de apresentações, documentos e websites.",
        categoria: "Criação de Conteúdo",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://gamma.app",
        tags: ["apresentações", "documentos", "websites", "criação"]
      },

      // === AUTOMAÇÃO ===
      {
        id: 35,
        nome: "⚡ Zapier AI",
        descricao: "Automação inteligente de tarefas conectando milhares de aplicativos.",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://zapier.com/ai",
        tags: ["automação", "integração", "workflow", "produtividade"]
      },
      {
        id: 36,
        nome: "🔄 Make (Integromat)",
        descricao: "Plataforma visual de automação com IA para conectar aplicativos.",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://make.com",
        tags: ["visual", "automação", "integração", "workflow"]
      },

      // === FERRAMENTAS ESPECIALIZADAS ===
      {
        id: 37,
        nome: "🔬 Consensus",
        descricao: "IA para pesquisa científica e análise de papers acadêmicos.",
        categoria: "Pesquisa Científica",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://consensus.app",
        tags: ["pesquisa", "científica", "papers", "acadêmico"]
      },
      {
        id: 38,
        nome: "🧠 Mem.ai",
        descricao: "IA para organização inteligente de notas e conhecimento pessoal.",
        categoria: "Gestão de Conhecimento",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://mem.ai",
        tags: ["notas", "conhecimento", "organização", "memória"]
      },
      {
        id: 39,
        nome: "🔊 Speechify",
        descricao: "IA que converte texto em fala natural para acessibilidade.",
        categoria: "Síntese de Voz",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://speechify.com",
        tags: ["texto-para-fala", "acessibilidade", "leitura", "natural"]
      },
      {
        id: 40,
        nome: "🎨 Figma AI",
        descricao: "Ferramentas de IA integradas ao Figma para design e prototipagem.",
        categoria: "Design",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://figma.com/ai",
        tags: ["design", "UI/UX", "prototipagem", "colaboração"]
      },

      // === MAIS ASSISTENTES CONVERSACIONAIS ===
      {
        id: 41,
        nome: "🧠 Bard (Gemini)",
        descricao: "IA conversacional do Google integrada com pesquisa em tempo real",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://bard.google.com",
        tags: ["google", "pesquisa", "tempo-real", "conversação"]
      },
      {
        id: 42,
        nome: "🔮 Character.AI",
        descricao: "Plataforma para criar e conversar com personagens de IA personalizados",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://character.ai",
        tags: ["personagens", "roleplay", "criativo", "entretenimento"]
      },
      {
        id: 43,
        nome: "🎭 Replika",
        descricao: "Companheiro de IA para conversas pessoais e desenvolvimento emocional",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://replika.ai",
        tags: ["companheiro", "emocional", "pessoal", "bem-estar"]
      },
      {
        id: 44,
        nome: "🤝 Pi AI",
        descricao: "IA pessoal da Inflection AI focada em conversas naturais e suporte",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://pi.ai",
        tags: ["pessoal", "suporte", "natural", "amigável"]
      },
      {
        id: 45,
        nome: "🌐 You.com",
        descricao: "Motor de busca com IA que fornece respostas conversacionais",
        categoria: "Pesquisa",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://you.com",
        tags: ["busca", "conversacional", "pesquisa", "web"]
      },

      // === FERRAMENTAS DE ESCRITA AVANÇADA ===
      {
        id: 46,
        nome: "✍️ Writesonic",
        descricao: "Plataforma completa de escrita com IA para marketing e conteúdo",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://writesonic.com",
        tags: ["escrita", "marketing", "SEO", "conteúdo"]
      },
      {
        id: 47,
        nome: "📝 Rytr",
        descricao: "Assistente de escrita com IA para diversos tipos de conteúdo",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://rytr.me",
        tags: ["escrita", "conteúdo", "blogs", "emails"]
      },
      {
        id: 48,
        nome: "🎨 Wordtune",
        descricao: "IA para reescrita e melhoria de textos com sugestões inteligentes",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://wordtune.com",
        tags: ["reescrita", "melhoria", "sugestões", "clareza"]
      },
      {
        id: 49,
        nome: "📖 Hemingway Editor",
        descricao: "IA para tornar a escrita mais clara e concisa",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://hemingwayapp.com",
        tags: ["clareza", "concisão", "edição", "legibilidade"]
      },
      {
        id: 50,
        nome: "🔍 ProWritingAid",
        descricao: "Ferramenta completa de edição com IA para escritores profissionais",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://prowritingaid.com",
        tags: ["edição", "profissional", "gramática", "estilo"]
      },

      // === MAIS FERRAMENTAS DE IMAGEM ===
      {
        id: 51,
        nome: "🎨 Artbreeder",
        descricao: "Plataforma colaborativa para criar e evoluir imagens com IA",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://artbreeder.com",
        tags: ["colaborativo", "evolução", "arte", "genética"]
      },
      {
        id: 52,
        nome: "🖼️ NightCafe",
        descricao: "Criador de arte com IA usando múltiplos algoritmos",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://nightcafe.studio",
        tags: ["arte", "múltiplos-algoritmos", "criativo", "comunidade"]
      },
      {
        id: 53,
        nome: "🎭 DeepArt",
        descricao: "Transforme fotos em obras de arte usando estilos famosos",
        categoria: "Edição de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://deepart.io",
        tags: ["transformação", "estilos", "arte-clássica", "filtros"]
      },
      {
        id: 54,
        nome: "📸 Photosonic",
        descricao: "Gerador de imagens realistas com IA da Writesonic",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://photosonic.writesonic.com",
        tags: ["realista", "fotografia", "alta-qualidade", "comercial"]
      },
      {
        id: 55,
        nome: "🎨 Playground AI",
        descricao: "Plataforma social para criação de arte com IA",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://playgroundai.com",
        tags: ["social", "comunidade", "arte", "compartilhamento"]
      },
      {
        id: 56,
        nome: "🖌️ Starryai",
        descricao: "App móvel para criação de arte com IA",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://starryai.com",
        tags: ["móvel", "app", "arte", "fácil-uso"]
      },
      {
        id: 57,
        nome: "🎪 Dream by WOMBO",
        descricao: "Criador de arte com IA simples e divertido",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://dream.ai",
        tags: ["simples", "divertido", "rápido", "móvel"]
      },
      {
        id: 58,
        nome: "🔧 Topaz Labs",
        descricao: "Suite de ferramentas de IA para melhoria de imagens",
        categoria: "Edição de Imagem",
        resultado: "Imagem",
        tipo: "Pago",
        preco: "Pago",
        link: "https://topazlabs.com",
        tags: ["melhoria", "profissional", "upscaling", "denoise"]
      },
      {
        id: 59,
        nome: "📷 Luminar AI",
        descricao: "Editor de fotos com IA para fotógrafos",
        categoria: "Edição de Imagem",
        resultado: "Imagem",
        tipo: "Pago",
        preco: "Pago",
        link: "https://skylum.com/luminar-ai",
        tags: ["fotografia", "edição", "profissional", "automação"]
      },
      {
        id: 60,
        nome: "🎨 Craiyon (DALL-E mini)",
        descricao: "Gerador de imagens gratuito baseado no DALL-E",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://craiyon.com",
        tags: ["gratuito", "dall-e", "simples", "rápido"]
      },

      // === MAIS FERRAMENTAS DE VÍDEO ===
      {
        id: 61,
        nome: "🎬 Luma AI",
        descricao: "IA para criação de vídeos 3D e efeitos visuais",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://lumalabs.ai",
        tags: ["3D", "efeitos-visuais", "realidade-aumentada", "captura"]
      },
      {
        id: 62,
        nome: "🎥 Fliki",
        descricao: "Criador de vídeos com IA a partir de texto",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://fliki.ai",
        tags: ["texto-para-vídeo", "voiceover", "automático", "marketing"]
      },
      {
        id: 63,
        nome: "📹 InVideo AI",
        descricao: "Plataforma de criação de vídeos com templates e IA",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://invideo.io",
        tags: ["templates", "marketing", "social-media", "automação"]
      },
      {
        id: 64,
        nome: "🎞️ Pictory",
        descricao: "IA para criar vídeos a partir de artigos e scripts",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://pictory.ai",
        tags: ["artigos", "scripts", "automático", "conteúdo"]
      },
      {
        id: 65,
        nome: "🎭 D-ID",
        descricao: "IA para criar vídeos com avatares falantes realistas",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://d-id.com",
        tags: ["avatares", "realista", "apresentação", "deepfake"]
      },
      {
        id: 66,
        nome: "📱 Loom AI",
        descricao: "Gravação de tela com recursos de IA para edição automática",
        categoria: "Edição de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://loom.com",
        tags: ["gravação-tela", "edição-automática", "produtividade", "tutoriais"]
      },
      {
        id: 67,
        nome: "🎬 Kapwing AI",
        descricao: "Editor de vídeo online com ferramentas de IA",
        categoria: "Edição de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://kapwing.com",
        tags: ["editor-online", "colaborativo", "templates", "social"]
      },
      {
        id: 68,
        nome: "🎥 Animoto",
        descricao: "Criador de vídeos com IA para marketing e redes sociais",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://animoto.com",
        tags: ["marketing", "redes-sociais", "templates", "automação"]
      },

      // === MAIS FERRAMENTAS DE ÁUDIO ===
      {
        id: 69,
        nome: "🎵 Beatoven.ai",
        descricao: "Compositor de música com IA para criadores de conteúdo",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://beatoven.ai",
        tags: ["composição", "criadores", "royalty-free", "personalizada"]
      },
      {
        id: 70,
        nome: "🎼 Amper Music",
        descricao: "IA para criação de trilhas sonoras personalizadas",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Pago",
        preco: "Pago",
        link: "https://ampermusic.com",
        tags: ["trilhas", "personalizada", "profissional", "licenciamento"]
      },
      {
        id: 71,
        nome: "🎤 Resemble AI",
        descricao: "Clonagem de voz com IA para criação de conteúdo",
        categoria: "Síntese de Voz",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://resemble.ai",
        tags: ["clonagem-voz", "síntese", "personalizada", "realista"]
      },
      {
        id: 72,
        nome: "🔊 Murf AI",
        descricao: "Gerador de voiceover com vozes naturais de IA",
        categoria: "Síntese de Voz",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://murf.ai",
        tags: ["voiceover", "natural", "múltiplas-vozes", "comercial"]
      },
      {
        id: 73,
        nome: "🎙️ Krisp",
        descricao: "IA para remoção de ruído em chamadas e gravações",
        categoria: "Edição de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://krisp.ai",
        tags: ["remoção-ruído", "chamadas", "produtividade", "qualidade"]
      },
      {
        id: 74,
        nome: "🎵 Endel",
        descricao: "IA que cria música adaptativa para foco e relaxamento",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://endel.io",
        tags: ["adaptativa", "foco", "relaxamento", "bem-estar"]
      },
      {
        id: 75,
        nome: "🔊 Lalal.ai",
        descricao: "IA para separação de stems musicais e remoção de vocal",
        categoria: "Edição de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://lalal.ai",
        tags: ["separação-stems", "remoção-vocal", "música", "produção"]
      },

      // === MAIS FERRAMENTAS DE CÓDIGO ===
      {
        id: 76,
        nome: "🤖 Amazon CodeWhisperer",
        descricao: "Assistente de código da AWS com IA para múltiplas linguagens",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://aws.amazon.com/codewhisperer",
        tags: ["AWS", "múltiplas-linguagens", "segurança", "enterprise"]
      },
      {
        id: 77,
        nome: "🔍 DeepCode",
        descricao: "IA para análise de código e detecção de bugs",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://deepcode.ai",
        tags: ["análise", "bugs", "segurança", "qualidade"]
      },
      {
        id: 78,
        nome: "⚡ Kite",
        descricao: "Assistente de código com IA para Python e JavaScript",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://kite.com",
        tags: ["python", "javascript", "autocompletar", "documentação"]
      },
      {
        id: 79,
        nome: "🛠️ Sourcery",
        descricao: "IA para refatoração automática de código Python",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://sourcery.ai",
        tags: ["refatoração", "python", "qualidade", "automação"]
      },
      {
        id: 80,
        nome: "🔧 Mintlify",
        descricao: "IA para geração automática de documentação de código",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://mintlify.com",
        tags: ["documentação", "automática", "comentários", "manutenção"]
      },
      {
        id: 81,
        nome: "🤖 Codeium",
        descricao: "Assistente de código gratuito com IA para desenvolvedores",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://codeium.com",
        tags: ["gratuito", "assistente", "múltiplas-linguagens", "IDE"]
      },
      {
        id: 82,
        nome: "🔍 CodeGuru",
        descricao: "IA da Amazon para revisão de código e otimização de performance",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Pago",
        preco: "Pago",
        link: "https://aws.amazon.com/codeguru",
        tags: ["amazon", "revisão", "performance", "otimização"]
      },

      // === FERRAMENTAS DE PRODUTIVIDADE AVANÇADA ===
      {
        id: 83,
        nome: "📊 MonkeyLearn",
        descricao: "IA para análise de texto e dados não estruturados",
        categoria: "Análise de Documentos",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://monkeylearn.com",
        tags: ["análise-texto", "dados", "sentimentos", "classificação"]
      },
      {
        id: 84,
        nome: "🔍 Algolia Recommend",
        descricao: "IA para sistemas de recomendação e busca inteligente",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Pago",
        preco: "Pago",
        link: "https://algolia.com/products/recommend",
        tags: ["recomendação", "busca", "e-commerce", "personalização"]
      },
      {
        id: 85,
        nome: "📈 DataRobot",
        descricao: "Plataforma de IA para ciência de dados automatizada",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Pago",
        preco: "Pago",
        link: "https://datarobot.com",
        tags: ["ciência-dados", "machine-learning", "enterprise", "automação"]
      },
      {
        id: 86,
        nome: "🧠 H2O.ai",
        descricao: "Plataforma open-source de IA para machine learning",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://h2o.ai",
        tags: ["open-source", "machine-learning", "dados", "análise"]
      },
      {
        id: 87,
        nome: "📊 Tableau AI",
        descricao: "IA integrada ao Tableau para análise de dados inteligente",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Pago",
        preco: "Pago",
        link: "https://tableau.com/products/tableau-ai",
        tags: ["visualização", "dados", "business-intelligence", "análise"]
      },
      {
        id: 88,
        nome: "🔮 Predict HQ",
        descricao: "IA para previsão de demanda baseada em eventos",
        categoria: "Automação",
        resultado: "Automação",
        tipo: "Pago",
        preco: "Pago",
        link: "https://predicthq.com",
        tags: ["previsão", "demanda", "eventos", "business"]
      },

      // === FERRAMENTAS ESPECIALIZADAS EXTRAS ===
      {
        id: 89,
        nome: "🎯 Persado",
        descricao: "IA para otimização de linguagem em marketing",
        categoria: "Texto",
        resultado: "Texto",
        tipo: "Pago",
        preco: "Pago",
        link: "https://persado.com",
        tags: ["marketing", "otimização", "linguagem", "conversão"]
      },
      {
        id: 90,
        nome: "🔬 Semantic Scholar",
        descricao: "IA para pesquisa acadêmica e análise de literatura científica",
        categoria: "Pesquisa Científica",
        resultado: "Texto",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://semanticscholar.org",
        tags: ["acadêmico", "pesquisa", "científica", "literatura"]
      },
      {
        id: 91,
        nome: "🎨 RunwayML Gen-2",
        descricao: "IA de nova geração para criação de vídeos a partir de texto",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://runwayml.com/ai-tools/gen-2",
        tags: ["texto-para-vídeo", "nova-geração", "criativo", "avançado"]
      },
      {
        id: 92,
        nome: "🤖 Anthropic Claude 2",
        descricao: "IA conversacional avançada com capacidades de análise profunda",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://claude.ai",
        tags: ["conversacional", "análise-profunda", "documentos", "seguro"]
      },
      {
        id: 93,
        nome: "🎵 Splice AI",
        descricao: "IA para criação musical colaborativa e samples",
        categoria: "Geração de Áudio",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://splice.com",
        tags: ["colaborativa", "samples", "produção", "música"]
      },
      {
        id: 94,
        nome: "📱 Appy Pie AI",
        descricao: "IA para criação de aplicativos sem código",
        categoria: "Programação",
        resultado: "Código",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://appypie.com",
        tags: ["no-code", "aplicativos", "móvel", "web"]
      },
      {
        id: 95,
        nome: "🎨 Designs.ai",
        descricao: "Suite completa de IA para design gráfico e criativo",
        categoria: "Design",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://designs.ai",
        tags: ["suite", "design-gráfico", "logos", "completo"]
      },
      {
        id: 96,
        nome: "🎬 Stable Video Diffusion",
        descricao: "Modelo open-source para geração de vídeos com IA",
        categoria: "Geração de Vídeo",
        resultado: "Vídeo",
        tipo: "Gratuito",
        preco: "Gratuito",
        link: "https://stability.ai/stable-video",
        tags: ["open-source", "vídeo", "stable-diffusion", "gratuito"]
      },
      {
        id: 97,
        nome: "🎤 Descript Overdub",
        descricao: "IA para clonagem de voz e edição de áudio avançada",
        categoria: "Síntese de Voz",
        resultado: "Áudio",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://descript.com/overdub",
        tags: ["clonagem-voz", "edição-áudio", "podcast", "profissional"]
      },
      {
        id: 98,
        nome: "🔍 Elicit",
        descricao: "Assistente de pesquisa com IA para literatura acadêmica",
        categoria: "Pesquisa Científica",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://elicit.org",
        tags: ["pesquisa", "acadêmica", "literatura", "análise"]
      },
      {
        id: 99,
        nome: "🎨 Ideogram",
        descricao: "IA especializada em geração de imagens com texto legível",
        categoria: "Geração de Imagem",
        resultado: "Imagem",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://ideogram.ai",
        tags: ["texto-legível", "tipografia", "logos", "design"]
      },
      {
        id: 100,
        nome: "🤖 Poe by Quora",
        descricao: "Plataforma que oferece acesso a múltiplos modelos de IA",
        categoria: "Assistente Geral",
        resultado: "Texto",
        tipo: "Freemium",
        preco: "Freemium",
        link: "https://poe.com",
        tags: ["múltiplos-modelos", "comparação", "acesso", "variedade"]
      }
    ];
  }

  /**
   * Busca ferramentas com filtros
   * @param {Object} filters - Filtros de busca
   * @param {string} searchTerm - Termo de busca
   * @returns {Array} Lista de ferramentas filtradas
   */
  async searchTools(filters = {}, searchTerm = '') {
    try {
      logger.info('Iniciando busca de ferramentas', { filters, searchTerm });
      
      // Garantir que sempre temos dados disponíveis
      if (!Array.isArray(this.tools) || this.tools.length === 0) {
        logger.warn('Recarregando dados de fallback...');
        this.tools = this.getFallbackData();
      }
      
      // Criar chave de cache
      const cacheKey = JSON.stringify({ filters, searchTerm });
      
      // Verificar cache
      if (this.cache.has(cacheKey)) {
        logger.info('Resultado encontrado no cache');
        return this.cache.get(cacheKey);
      }
      
      let results = [...this.tools];
      
      // Aplicar filtros
      if (filters.categoria && filters.categoria.length > 0) {
        results = results.filter(tool => 
          filters.categoria.includes(tool.categoria)
        );
      }
      
      if (filters.preco && filters.preco.length > 0) {
        results = results.filter(tool => 
          filters.preco.includes(tool.preco)
        );
      }
      
      if (filters.complexidade && filters.complexidade.length > 0) {
        results = results.filter(tool => {
          const complexidade = this.getComplexidade(tool.categoria);
          return filters.complexidade.includes(complexidade);
        });
      }
      
      // Aplicar busca por termo
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        results = results.filter(tool => {
          const searchableText = [
            tool.nome,
            tool.descricao,
            tool.categoria,
            tool.tags?.join(' ') || ''
          ].join(' ').toLowerCase();
          
          return searchableText.includes(term);
        });
      }
      
      // Ordenar por relevância
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        results.sort((a, b) => {
          const aScore = this.calculateRelevanceScore(a, term);
          const bScore = this.calculateRelevanceScore(b, term);
          return bScore - aScore;
        });
      }
      
      // Cache do resultado
      this.cache.set(cacheKey, results);
      
      logger.info('Busca concluída com sucesso!', { 
        totalTools: this.tools.length,
        filteredResults: results.length,
        filters,
        searchTerm 
      });
      
      return results;
      
    } catch (error) {
      logger.error('Erro durante a busca, retornando dados de fallback:', error);
      // Em caso de erro, retornar pelo menos os dados de fallback
      try {
        const fallbackData = this.getFallbackData();
        logger.info('Dados de fallback retornados com sucesso');
        return fallbackData;
      } catch (fallbackError) {
        logger.error('Erro crítico ao obter fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Determina a complexidade de uma ferramenta baseada na categoria
   * @param {string} categoria - Categoria da ferramenta
   * @returns {string} Nível de complexidade
   */
  getComplexidade(categoria) {
    const simplesCategories = [
      'Assistente Geral',
      'Texto para Imagem',
      'Texto para Voz',
      'Produtividade'
    ];
    return simplesCategories.includes(categoria) ? 'Simples' : 'Avançado';
  }

  /**
   * Obtém todas as ferramentas
   * @returns {Array} Lista completa de ferramentas
   */
  getAllTools() {
    return [...this.tools];
  }

  /**
   * Obtém ferramenta por ID
   * @param {number} id - ID da ferramenta
   * @returns {Object|null} Ferramenta encontrada ou null
   */
  getToolById(id) {
    return this.tools.find(tool => tool.id === id) || null;
  }

  /**
   * Obtém estatísticas das ferramentas
   * @returns {Object} Estatísticas
   */
  getStats() {
    const stats = {
      total: this.tools.length,
      byTipo: {},
      byResultado: {},
      byComplexidade: {}
    };

    this.tools.forEach(tool => {
      // Contar por tipo
      stats.byTipo[tool.tipo] = (stats.byTipo[tool.tipo] || 0) + 1;
      
      // Contar por resultado
      stats.byResultado[tool.resultado] = (stats.byResultado[tool.resultado] || 0) + 1;
      
      // Contar por complexidade
      const complexidade = this.getComplexidade(tool.categoria);
      stats.byComplexidade[complexidade] = (stats.byComplexidade[complexidade] || 0) + 1;
    });

    return stats;
  }

  /**
   * Limpa o cache de busca
   */
  clearCache() {
    this.cache.clear();
    logger.info('Cache limpo');
  }

  // ========================================
  // FUTURAS INTEGRAÇÕES (COMENTADAS)
  // ========================================

  /**
   * INTEGRAÇÃO COM NOTION (FUTURA)
   * 
   * async loadFromNotion(notionConfig) {
   *   try {
   *     const { Client } = await import('@notionhq/client');
   *     const notion = new Client({ auth: notionConfig.token });
   *     
   *     const response = await notion.databases.query({
   *       database_id: notionConfig.databaseId,
   *       sorts: [
   *         {
   *           property: 'Nome',
   *           direction: 'ascending'
   *         }
   *       ]
   *     });
   *     
   *     const tools = response.results.map(page => ({
   *       id: page.id,
   *       nome: page.properties.Nome?.title[0]?.text?.content || '',
   *       descricao: page.properties.Descrição?.rich_text[0]?.text?.content || '',
   *       categoria: page.properties.Categoria?.select?.name || '',
   *       resultado: page.properties.Resultado?.select?.name || '',
   *       tipo: page.properties.Tipo?.select?.name || '',
   *       link: page.properties.Link?.url || '',
   *       tags: page.properties.Tags?.multi_select?.map(tag => tag.name) || []
   *     }));
   *     
   *     this.tools = tools;
   *     this.lastUpdate = Date.now();
   *     this.clearCache();
   *     
   *     logger.info(`${tools.length} ferramentas carregadas do Notion`);
   *     return tools;
   *   } catch (error) {
   *     logger.error('Erro ao carregar do Notion:', error);
   *     throw error;
   *   }
   * }
   */

  /**
   * INTEGRAÇÃO COM GOOGLE SHEETS (FUTURA)
   * 
   * async loadFromGoogleSheets(sheetsConfig) {
   *   try {
   *     const { google } = await import('googleapis');
   *     const sheets = google.sheets({ version: 'v4', auth: sheetsConfig.auth });
   *     
   *     const response = await sheets.spreadsheets.values.get({
   *       spreadsheetId: sheetsConfig.spreadsheetId,
   *       range: sheetsConfig.range || 'A:H'
   *     });
   *     
   *     const [headers, ...rows] = response.data.values;
   *     
   *     const tools = rows.map((row, index) => ({
   *       id: index + 1,
   *       nome: row[0] || '',
   *       descricao: row[1] || '',
   *       categoria: row[2] || '',
   *       resultado: row[3] || '',
   *       tipo: row[4] || '',
   *       link: row[5] || '',
   *       tags: row[6] ? row[6].split(',').map(tag => tag.trim()) : []
   *     }));
   *     
   *     this.tools = tools;
   *     this.lastUpdate = Date.now();
   *     this.clearCache();
   *     
   *     logger.info(`${tools.length} ferramentas carregadas do Google Sheets`);
   *     return tools;
   *   } catch (error) {
   *     logger.error('Erro ao carregar do Google Sheets:', error);
   *     throw error;
   *   }
   * }
   */

  /**
   * SINCRONIZAÇÃO AUTOMÁTICA (FUTURA)
   * 
   * async setupAutoSync(config) {
   *   const syncInterval = config.interval || 3600000; // 1 hora
   *   
   *   setInterval(async () => {
   *     try {
   *       if (config.source === 'notion') {
   *         await this.loadFromNotion(config.notion);
   *       } else if (config.source === 'sheets') {
   *         await this.loadFromGoogleSheets(config.sheets);
   *       }
   *       logger.info('Sincronização automática realizada');
   *     } catch (error) {
   *       logger.error('Erro na sincronização automática:', error);
   *     }
   *   }, syncInterval);
   * }
   */
}

// Instância singleton
const aiToolsService = new AIToolsService();

export default aiToolsService;
export { AIToolsService };