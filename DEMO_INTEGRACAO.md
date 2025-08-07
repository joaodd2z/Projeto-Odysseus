# 🚀 Demonstração da Integração Odysseus Content API

## ✅ Status Atual

### **Servidor Funcionando**
- ✅ API REST rodando em `http://localhost:3000`
- ✅ Endpoint de saúde: `/health` - **FUNCIONANDO**
- ⚠️ Endpoints de busca: Aguardando configuração da chave da API

### **Estrutura Implementada**
```
odysseus-content-api/
├── src/
│   ├── functions/videos.ts     # Funções principais do YouTube
│   ├── simple-server.ts        # Servidor HTTP simplificado
│   ├── http-server.ts          # Servidor MCP completo
│   └── types/youtube.ts        # Tipos TypeScript
├── dist/                       # Arquivos compilados
├── .env                        # Configurações (PRECISA DA API KEY)
└── package.json               # Dependências e scripts
```

## 🔧 Configuração Necessária

### **1. Obter Chave da API do YouTube**

1. **Acesse**: https://console.cloud.google.com/
2. **Crie um projeto** ou selecione um existente
3. **Ative a API**: Vá em "APIs & Services" > "Library" > Busque "YouTube Data API v3" > Ativar
4. **Crie credenciais**: "APIs & Services" > "Credentials" > "Create Credentials" > "API Key"
5. **Configure restrições** (opcional mas recomendado):
   - Application restrictions: HTTP referrers
   - API restrictions: YouTube Data API v3

### **2. Configurar o Arquivo .env**
```env
# Substitua YOUR_API_KEY_HERE pela sua chave real
YOUTUBE_API_KEY=AIzaSyC-sua_chave_api_aqui_exemplo
YOUTUBE_TRANSCRIPT_LANG=pt
```

## 🎯 Como Integrar com o Projeto Odysseus

### **Cenário 1: Busca de Conteúdo Educacional**
```javascript
// No frontend React do Odysseus
const buscarConteudoEducacional = async (habilidade) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/search?q=${habilidade} tutorial&maxResults=10`
    );
    const videos = await response.json();
    
    // Processar vídeos para criar trilha de aprendizado
    return videos.map(video => ({
      id: video.id.videoId,
      titulo: video.snippet.title,
      canal: video.snippet.channelTitle,
      descricao: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium.url,
      dataPublicacao: video.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
  }
};

// Exemplo de uso
const videosReact = await buscarConteudoEducacional('React.js');
const videosPython = await buscarConteudoEducacional('Python para iniciantes');
```

### **Cenário 2: Análise de Vídeo Específico**
```javascript
// Obter detalhes completos de um vídeo
const analisarVideo = async (videoId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/video/${videoId}`);
    const video = await response.json();
    
    return {
      titulo: video.snippet.title,
      duracao: video.contentDetails.duration,
      visualizacoes: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      comentarios: video.statistics.commentCount,
      categoria: video.snippet.categoryId,
      tags: video.snippet.tags || [],
      // Calcular métricas de engajamento
      taxaEngajamento: (
        (parseInt(video.statistics.likeCount) + parseInt(video.statistics.commentCount)) /
        parseInt(video.statistics.viewCount) * 100
      ).toFixed(2)
    };
  } catch (error) {
    console.error('Erro ao analisar vídeo:', error);
  }
};
```

### **Cenário 3: Dashboard de Habilidades**
```javascript
// Componente React para mostrar tendências de habilidades
const DashboardHabilidades = () => {
  const [habilidades, setHabilidades] = useState([]);
  
  useEffect(() => {
    const carregarTendencias = async () => {
      const habilidadesPopulares = [
        'JavaScript', 'Python', 'React', 'Node.js', 
        'Machine Learning', 'Data Science'
      ];
      
      const dados = await Promise.all(
        habilidadesPopulares.map(async (habilidade) => {
          const videos = await buscarConteudoEducacional(habilidade);
          return {
            nome: habilidade,
            totalVideos: videos.length,
            videosRecentes: videos.filter(v => 
              new Date(v.dataPublicacao) > new Date(Date.now() - 30*24*60*60*1000)
            ).length
          };
        })
      );
      
      setHabilidades(dados);
    };
    
    carregarTendencias();
  }, []);
  
  return (
    <div className="dashboard-habilidades">
      <h2>📊 Tendências de Aprendizado</h2>
      {habilidades.map(habilidade => (
        <div key={habilidade.nome} className="habilidade-card">
          <h3>{habilidade.nome}</h3>
          <p>Total de vídeos: {habilidade.totalVideos}</p>
          <p>Novos este mês: {habilidade.videosRecentes}</p>
        </div>
      ))}
    </div>
  );
};
```

## 🔄 Fluxo de Integração Completo

### **1. Arquitetura Proposta**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │    │    Backend       │    │  Content API        │
│   React         │◄──►│    Python        │◄──►│  Node.js            │
│   (Porta 3001)  │    │    (Porta 5000)  │    │  (Porta 3000)       │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                          │
                                                          ▼
                                                ┌─────────────────────┐
                                                │  YouTube Data API   │
                                                │  (Google Cloud)     │
                                                └─────────────────────┘
```

### **2. Endpoints Implementados**

#### **Servidor Simples (Recomendado para início)**
- `GET /health` ✅ **Funcionando**
- `GET /api/search?q=termo&maxResults=10` ⚠️ **Precisa da API Key**
- `GET /api/video/{videoId}` ⚠️ **Precisa da API Key**

#### **Servidor MCP Completo (Para funcionalidades avançadas)**
- `POST /api/mcp/searchVideos` - Busca avançada com filtros
- `POST /api/mcp/getVideoDetails` - Detalhes completos + estatísticas
- `POST /api/mcp/getTranscripts` - Extração de legendas/transcrições
- `POST /api/mcp/getChannelStatistics` - Análise de canais
- `POST /api/mcp/getChannelTopVideos` - Top vídeos por canal
- `POST /api/mcp/getVideoEngagementRatio` - Métricas de engajamento
- `POST /api/mcp/getTrendingVideos` - Vídeos em tendência por região
- `POST /api/mcp/compareVideos` - Comparação entre múltiplos vídeos

## 🎯 Casos de Uso Específicos para Odysseus

### **1. Geração Automática de Trilhas**
```javascript
// Criar trilha de aprendizado baseada em vídeos do YouTube
const criarTrilhaAprendizado = async (habilidade, nivel) => {
  const termoBusca = `${habilidade} ${nivel} tutorial`;
  const videos = await buscarConteudoEducacional(termoBusca);
  
  // Ordenar por relevância e data
  const trilha = videos
    .sort((a, b) => new Date(a.dataPublicacao) - new Date(b.dataPublicacao))
    .slice(0, 10);
    
  return {
    habilidade,
    nivel,
    videos: trilha,
    tempoEstimado: trilha.length * 15, // 15 min por vídeo
    dificuldade: nivel
  };
};
```

### **2. Sistema de Recomendações**
```javascript
// Recomendar conteúdo baseado no perfil do usuário
const recomendarConteudo = async (perfilUsuario) => {
  const { habilidadesInteresse, nivelExperiencia } = perfilUsuario;
  
  const recomendacoes = await Promise.all(
    habilidadesInteresse.map(habilidade => 
      criarTrilhaAprendizado(habilidade, nivelExperiencia)
    )
  );
  
  return recomendacoes;
};
```

### **3. Análise de Tendências**
```javascript
// Identificar habilidades em alta
const analisarTendencias = async () => {
  const habilidades = ['AI', 'Blockchain', 'Cloud Computing', 'DevOps'];
  
  const tendencias = await Promise.all(
    habilidades.map(async (habilidade) => {
      const videos = await buscarConteudoEducacional(habilidade);
      const videosRecentes = videos.filter(v => 
        new Date(v.dataPublicacao) > new Date(Date.now() - 7*24*60*60*1000)
      );
      
      return {
        habilidade,
        crescimento: videosRecentes.length,
        popularidade: videos.reduce((acc, v) => acc + parseInt(v.visualizacoes || 0), 0)
      };
    })
  );
  
  return tendencias.sort((a, b) => b.crescimento - a.crescimento);
};
```

## 🚀 Próximos Passos

1. **Configurar API Key** do YouTube Data API v3
2. **Testar endpoints** com dados reais
3. **Integrar no backend** Python do Odysseus
4. **Criar componentes** React para exibir dados
5. **Implementar cache** para otimizar performance
6. **Adicionar autenticação** para proteger a API

---

**🎯 Resultado Esperado**: Uma API robusta que transforme dados do YouTube em insights educacionais para o Projeto Odysseus, permitindo:
- Busca inteligente de conteúdo
- Geração automática de trilhas de aprendizado
- Análise de tendências educacionais
- Recomendações personalizadas
- Dashboard de métricas de aprendizado

**📞 Status**: ✅ **Infraestrutura pronta** - Aguardando apenas configuração da API Key para testes completos!