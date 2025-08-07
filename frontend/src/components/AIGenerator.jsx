import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAppStore } from '../stores/useAppStore';
import { playClickSound, playSuccessSound, playErrorSound } from '../utils/soundSystem';
import { createLogger } from '../utils/logger';
import SkillTreeDisplay from './SkillTreeDisplay';

const logger = createLogger('AIGenerator');

const AIGenerator = ({ onSkillTreeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [skillTreeData, setSkillTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { generateSkillTree } = useAppStore();

  const handleGenerateTree = async () => {
    try {
      if (!prompt.trim()) {
        setErrorMessage('Por favor, digite uma carreira ou objetivo.');
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setErrorMessage('Chave da API não configurada.');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');
      setSkillTreeData(null);
      
      logger.info('Iniciando geração de árvore de habilidades', {
        promptLength: prompt.length
      });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
Você é um especialista em desenvolvimento de carreira e criação de roadmaps de aprendizado.
Crie uma árvore de habilidades estruturada para a carreira: "${prompt}"

Retorne APENAS um JSON válido no seguinte formato:
{
  "objetivo": "Nome da carreira",
  "descricao": "Descrição da carreira",
  "categorias": [
    {
      "nome": "Nome da categoria",
      "cor": "#hexcolor",
      "habilidades": [
        {
          "nome": "Nome da habilidade",
          "nivel": "iniciante|intermediario|avancado",
          "descricao": "Descrição detalhada",
          "recursos": [
            {
              "tipo": "curso|livro|tutorial|documentacao|projeto",
              "titulo": "Título do recurso",
              "url": "URL válida",
              "gratuito": true|false
            }
          ],
          "prerequisitos": ["habilidade1", "habilidade2"],
          "tempoEstimado": "X semanas|meses",
          "projetos": ["Projeto prático 1", "Projeto prático 2"]
        }
      ]
    }
  ],
  "roadmap": [
    {
      "fase": "Fase 1: Fundamentos",
      "duracao": "1-2 meses",
      "habilidades": ["habilidade1", "habilidade2"]
    }
  ]
}

Dicas importantes:
- Use cores hex válidas e variadas
- Inclua 4-6 categorias principais
- 3-5 habilidades por categoria
- URLs reais e funcionais
- Projetos práticos relevantes
- Roadmap com 3-4 fases progressivas
`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Resposta recebida da API', {
        responseLength: text.length
      });

      // Limpar a resposta removendo markdown
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const parsedData = JSON.parse(cleanedText);
        
        // Validar estrutura básica
        if (!parsedData.objetivo || !parsedData.categorias || !Array.isArray(parsedData.categorias)) {
          throw new Error('Estrutura de dados inválida');
        }
        
        logger.info('Árvore de habilidades gerada com sucesso', {
          objetivo: parsedData.objetivo,
          categorias: parsedData.categorias.length
        });
        
        setSkillTreeData(parsedData);
        playSuccessSound();
        
        if (onSkillTreeGenerated) {
          onSkillTreeGenerated(parsedData);
        }
        
      } catch (parseError) {
        logger.error('Erro ao fazer parse do JSON', parseError);
        setErrorMessage('Erro ao processar resposta da IA. Tente novamente.');
        playErrorSound();
      }
      
    } catch (error) {
      logger.error('Erro na geração da árvore', error);
      setErrorMessage('Erro ao gerar árvore de habilidades. Verifique sua conexão.');
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  const generateResourceLinks = (skillName) => {
    const encodedSkill = encodeURIComponent(skillName);
    
    return [
      {
        tipo: 'documentacao',
        titulo: `Documentação - ${skillName}`,
        url: `https://www.google.com/search?q=${encodedSkill}+documentation`,
        gratuito: true
      },
      {
        tipo: 'tutorial',
        titulo: `Tutorial MDN - ${skillName}`,
        url: `https://developer.mozilla.org/en-US/search?q=${encodedSkill}`,
        gratuito: true
      },
      {
        tipo: 'curso',
        titulo: `Vídeos YouTube - ${skillName}`,
        url: `https://www.youtube.com/results?search_query=${encodedSkill}+tutorial`,
        gratuito: true
      },
      {
        tipo: 'projeto',
        titulo: `Projetos GitHub - ${skillName}`,
        url: `https://github.com/search?q=${encodedSkill}&type=repositories`,
        gratuito: true
      },
      {
        tipo: 'curso',
        titulo: `Modelos Hugging Face - ${skillName}`,
        url: `https://huggingface.co/models?search=${encodedSkill}`,
        gratuito: true
      },
      {
        tipo: 'comunidade',
        titulo: `Comunidade Reddit - ${skillName}`,
        url: `https://www.reddit.com/search/?q=${encodedSkill}`,
        gratuito: true
      },
      {
        tipo: 'forum',
        titulo: `Stack Overflow - ${skillName}`,
        url: `https://stackoverflow.com/search?q=${encodedSkill}`,
        gratuito: true
      },
      {
        tipo: 'rede',
        titulo: `LinkedIn Learning - ${skillName}`,
        url: `https://www.linkedin.com/learning/search?keywords=${encodedSkill}`,
        gratuito: false
      },
      {
        tipo: 'comunidade',
        titulo: 'Comunidade Telegram - Programadores BR',
        url: 'https://t.me/ProgramadoresBR',
        gratuito: true
      },
      {
        tipo: 'comunidade',
        titulo: 'Comunidade Discord - JavaScript Brasil',
        url: 'https://discord.gg/javascript-brasil',
        gratuito: true
      },
      {
        tipo: 'blog',
        titulo: `Artigos Dev.to - ${skillName}`,
        url: `https://dev.to/search?q=${encodedSkill}`,
        gratuito: true
      },
      {
        tipo: 'curso',
        titulo: `Coursera - ${skillName}`,
        url: `https://www.coursera.org/search?query=${encodedSkill}`,
        gratuito: false
      },
      {
        tipo: 'curso',
        titulo: `Udemy - ${skillName}`,
        url: `https://www.udemy.com/courses/search/?q=${encodedSkill}`,
        gratuito: false
      },
      {
        tipo: 'livro',
        titulo: `Livros Amazon - ${skillName}`,
        url: `https://www.amazon.com/s?k=${encodedSkill}+programming+book`,
        gratuito: false
      },
      {
        tipo: 'curso',
        titulo: `edX - ${skillName}`,
        url: `https://www.edx.org/search?q=${encodedSkill}`,
        gratuito: true
      }
    ];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      playClickSound();
      handleGenerateTree();
    }
  };

  const handleButtonClick = () => {
    playClickSound();
    handleGenerateTree();
  };

  const handleClearResults = () => {
    playClickSound();
    setSkillTreeData(null);
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
          🌳 Gerador de Árvore de Habilidades
        </h1>
        <p className="text-gray-300 text-lg">
          Digite sua carreira ou objetivo e receba um roadmap personalizado
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="career-input" className="block text-sm font-medium text-gray-300 mb-2">
              Carreira ou Objetivo
            </label>
            <input
              id="career-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Desenvolvedor Full Stack, Data Scientist, Designer UX/UI..."
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleButtonClick}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  🚀 Gerar Árvore de Habilidades
                </>
              )}
            </button>
            
            {skillTreeData && (
              <button
                onClick={handleClearResults}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                🗑️ Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-red-300">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-300 text-center">
              🤖 Analisando sua carreira e criando roadmap personalizado...
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {skillTreeData && (
        <div className="space-y-6">
          <SkillTreeDisplay 
            skillTreeData={skillTreeData} 
            onSkillTreeGenerated={onSkillTreeGenerated}
          />
        </div>
      )}
    </div>
  );
};

export default AIGenerator;