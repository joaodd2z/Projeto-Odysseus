# Integração da API de Conteúdo do YouTube com o Projeto Odysseus

## 📋 Visão Geral

Este repositório (`odysseus-content-api`) foi adaptado do projeto `youtube-data-mcp-server` encontrado no GitHub e integrado ao **Projeto Odysseus** para fornecer funcionalidades avançadas de análise de conteúdo do YouTube.

## 🚀 Funcionalidades Implementadas

### 1. **API REST Simples**
- **Endpoint de Saúde**: `GET /health`
- **Busca de Vídeos**: `GET /api/search?q=termo_busca&maxResults=10`
- **Detalhes do Vídeo**: `GET /api/video/{videoId}`

### 2. **Funcionalidades Avançadas do YouTube**
- ✅ Busca de vídeos por termo
- ✅ Obtenção de detalhes completos de vídeos
- ✅ Extração de transcrições/legendas
- ✅ Análise de estatísticas de canais
- ✅ Vídeos mais populares de um canal
- ✅ Cálculo de taxa de engajamento
- ✅ Vídeos em tendência por região
- ✅ Comparação entre múltiplos vídeos

## 🔧 Configuração

### 1. **Variáveis de Ambiente**
Configure o arquivo `.env`:
```env
# OBRIGATÓRIO: Chave da API do YouTube Data v3
# Obtenha em: https://console.developers.google.com/
# 1. Crie um projeto ou selecione um existente
# 2. Ative a API "YouTube Data API v3"
# 3. Crie credenciais (Chave de API)
# 4. Configure as restrições de API conforme necessário
YOUTUBE_API_KEY=sua_chave_api_aqui

# OPCIONAL: Idioma padrão para transcrições (padrão: pt para português)
YOUTUBE_TRANSCRIPT_LANG=pt
```

### 2. **Instalação e Execução**
```bash
# Instalar dependências
npm install

# Compilar o projeto
npm run build

# Iniciar servidor simples (recomendado)
npm run start:simple

# Ou iniciar servidor completo MCP
npm run start:http
```

## 🔗 Integração com o Projeto Odysseus

### 1. **Arquitetura de Integração**
```
Projeto Odysseus (Frontend React)
        ↓
Backend Python (FastAPI) - Porta 5000
        ↓
Odysseus Content API (Node.js) - Porta 3000
        ↓
YouTube Data API v3
```

### 2. **Configuração no Backend Principal**
No arquivo `backend/main.py`, adicione endpoints para comunicação:

```python
import httpx

# Configuração da API de Conteúdo
CONTENT_API_BASE = "http://localhost:3000"

@app.get("/api/youtube/search")
async def search_youtube_videos(q: str, max_results: int = 10):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{CONTENT_API_BASE}/api/search",
            params={"q": q, "maxResults": max_results}
        )
        return response.json()

@app.get("/api/youtube/video/{video_id}")
async def get_youtube_video(video_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{CONTENT_API_BASE}/api/video/{video_id}")
        return response.json()
```

### 3. **Configuração no Frontend**
No arquivo `frontend/src/services/api.js`, adicione funções:

```javascript
// Buscar vídeos do YouTube
export const searchYouTubeVideos = async (query, maxResults = 10) => {
  try {
    const response = await api.get('/youtube/search', {
      params: { q: query, max_results: maxResults }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    throw error;
  }
};

// Obter detalhes de um vídeo
export const getYouTubeVideo = async (videoId) => {
  try {
    const response = await api.get(`/youtube/video/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter vídeo:', error);
    throw error;
  }
};
```

## 📊 Casos de Uso no Projeto Odysseus

### 1. **Análise de Habilidades via Conteúdo**
- Buscar vídeos relacionados a habilidades específicas
- Analisar tendências de aprendizado
- Recomendar conteúdo educacional

### 2. **Geração de Trilhas de Aprendizado**
- Identificar vídeos sequenciais sobre um tópico
- Calcular tempo total de aprendizado
- Avaliar qualidade do conteúdo via métricas de engajamento

### 3. **Dashboard de Análise**
- Mostrar estatísticas de canais educacionais
- Comparar diferentes criadores de conteúdo
- Identificar vídeos em tendência por área

## 🛠️ Endpoints Disponíveis

### **Servidor Simples (Porta 3000)**
- `GET /health` - Status da API
- `GET /api/search?q=termo&maxResults=10` - Buscar vídeos
- `GET /api/video/{videoId}` - Detalhes do vídeo

### **Servidor Completo MCP (Porta 3000)**
- `POST /api/mcp/searchVideos` - Busca avançada
- `POST /api/mcp/getVideoDetails` - Detalhes completos
- `POST /api/mcp/getTranscripts` - Transcrições
- `POST /api/mcp/getChannelStatistics` - Estatísticas do canal
- `POST /api/mcp/getChannelTopVideos` - Top vídeos do canal
- `POST /api/mcp/getVideoEngagementRatio` - Taxa de engajamento
- `POST /api/mcp/getTrendingVideos` - Vídeos em tendência
- `POST /api/mcp/compareVideos` - Comparar vídeos

## 🔒 Segurança e Boas Práticas

1. **Rate Limiting**: Implementado para evitar abuso da API
2. **CORS**: Configurado para permitir acesso do frontend
3. **Validação**: Parâmetros validados em todos os endpoints
4. **Error Handling**: Tratamento robusto de erros
5. **Environment Variables**: Chaves de API protegidas

## 📈 Próximos Passos

1. **Implementar Cache**: Redis para cache de respostas da API
2. **Adicionar Autenticação**: JWT para proteger endpoints
3. **Métricas**: Implementar logging e monitoramento
4. **Testes**: Adicionar testes unitários e de integração
5. **Docker**: Containerizar a aplicação

## 🤝 Como Contribuir

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes se necessário
5. Faça um pull request

---

**Desenvolvido para o Projeto Odysseus** 🚀
*Transformando dados do YouTube em insights educacionais*