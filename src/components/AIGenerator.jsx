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
      "habilidades": [
        {
          "nome": "Nome da habilidade",
          "descricao": "Descrição da habilidade",
          "nivel": "iniciante|intermediario|avancado",
          "importancia": "baixa|media|alta|critica",
          "tempoAprendizado": "Tempo estimado"
        }
      ]
    }
  ]
}
`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Resposta da API recebida', {
        responseLength: text.length
      });

      // Limpar e parsear a resposta
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Remover caracteres problemáticos específicos
      cleanedText = cleanedText
        .replace(/[Ø<ß3]/g, '') // Remove caracteres específicos problemáticos
        .replace(/[^\x20-\x7E\u00C0-\u017F\u1E00-\u1EFF{}\[\]":,]/g, '') // Mantém apenas caracteres válidos para JSON
        .replace(/\s+/g, ' ') // Normaliza espaços
        .trim();

      const parsedData = JSON.parse(cleanedText);
      
      // Transformar dados para o formato esperado pelas exportações
      const formattedData = {
        goal: parsedData.objetivo || prompt,
        description: parsedData.descricao || '',
        categories: (parsedData.categorias || []).map(categoria => ({
          name: categoria.nome,
          skills: (categoria.habilidades || []).map(habilidade => ({
            name: habilidade.nome,
            description: habilidade.descricao || '',
            level: habilidade.nivel || 'iniciante',
            importance: habilidade.importancia || 'media',
            estimatedTime: habilidade.tempoAprendizado || '1-2 semanas',
            url: null, // Será preenchido pelo YouTube service
            
            // 📚 Documentações Oficiais (URLs reais e funcionais)
            documentation: [
              {
                title: `Documentação Oficial - ${habilidade.nome}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(habilidade.nome + ' documentação oficial')}`,
                description: `Documentação oficial e guias de referência para ${habilidade.nome}`,
                type: 'official'
              },
              {
                title: `MDN Web Docs - ${habilidade.nome}`,
                url: `https://developer.mozilla.org/pt-BR/search?q=${encodeURIComponent(habilidade.nome)}`,
                description: `Recursos e tutoriais do MDN para ${habilidade.nome}`,
                type: 'reference'
              }
            ],
            
            // 🎥 Conteúdo do YouTube (URLs de busca reais)
            youtubeContent: {
              playlists: [
                {
                  title: `Curso Completo de ${habilidade.nome}`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' curso completo')}&sp=EgIQAw%253D%253D`,
                  description: `Busca por playlists completas de ${habilidade.nome}`,
                  videoCount: 'Variável',
                  duration: 'Variável',
                  channel: 'Vários canais'
                },
                {
                  title: `${habilidade.nome} - Bootcamp`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' bootcamp')}&sp=EgIQAw%253D%253D`,
                  description: `Bootcamps e cursos intensivos de ${habilidade.nome}`,
                  videoCount: 'Variável',
                  duration: 'Variável',
                  channel: 'Vários canais'
                }
              ],
              videos: [
                {
                  title: `${habilidade.nome} - Tutoriais`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' tutorial')}`,
                  duration: 'Variável',
                  channel: 'Vários canais',
                  views: 'Variável'
                },
                {
                  title: `${habilidade.nome} - Guia Prático`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' guia prático 2024')}`,
                  duration: 'Variável',
                  channel: 'Vários canais',
                  views: 'Variável'
                },
                {
                  title: `${habilidade.nome} - Projetos`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' projetos práticos')}`,
                  duration: 'Variável',
                  channel: 'Vários canais',
                  views: 'Variável'
                }
              ],
              shorts: [
                {
                  title: `${habilidade.nome} - Dicas Rápidas`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' dicas rápidas')}&sp=EgIYAQ%253D%253D`,
                  duration: 'Até 60s',
                  channel: 'Vários canais',
                  views: 'Variável'
                },
                {
                  title: `${habilidade.nome} - Introdução`,
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(habilidade.nome + ' introdução')}&sp=EgIYAQ%253D%253D`,
                  duration: 'Até 60s',
                  channel: 'Vários canais',
                  views: 'Variável'
                }
              ]
            },
            
            // 💻 Repositórios e Código
            repositories: {
              github: [
                {
                  title: `Awesome ${habilidade.nome}`,
                  url: `https://github.com/search?q=${encodeURIComponent(habilidade.nome.toLowerCase())}&type=repositories&s=stars&o=desc`,
                  description: `Lista curada de recursos incríveis para ${habilidade.nome}`,
                  stars: 'Variável',
                  language: 'Markdown'
                },
                {
                  title: `${habilidade.nome} - Projetos Práticos`,
                  url: `https://github.com/search?q=${encodeURIComponent(habilidade.nome.toLowerCase())}&type=repositories&s=stars&o=desc`,
                  description: `Projetos práticos e tutoriais usando ${habilidade.nome}`,
                  stars: 'Variável',
                  language: 'Variável'
                },
                {
                  title: `${habilidade.nome} - Exemplos e Templates`,
                  url: `https://github.com/search?q=${encodeURIComponent(habilidade.nome.toLowerCase())}&type=repositories&s=stars&o=desc`,
                  description: `Exemplos e templates prontos para usar com ${habilidade.nome}`,
                  stars: 'Variável',
                  language: 'Variável'
                }
              ],
              huggingface: [
                {
                  title: `${habilidade.nome} Models`,
                  url: `https://huggingface.co/models?search=${encodeURIComponent(habilidade.nome)}`,
                  description: `Modelos e datasets relacionados a ${habilidade.nome}`,
                  type: 'models'
                }
              ]
            },
            
            // 🌐 Comunidades de Estudo e Networking (URLs reais)
            communities: {
              study: [
                {
                  name: `Discord - Programação Brasil`,
                  platform: 'Discord',
                  url: `https://discord.gg/javascript`,
                  description: `Maior comunidade brasileira de programação no Discord`,
                  members: '50K+',
                  type: 'study'
                },
                {
                  name: `Reddit - r/${habilidade.nome.toLowerCase()}`,
                  platform: 'Reddit',
                  url: `https://www.reddit.com/search/?q=${encodeURIComponent(habilidade.nome)}`,
                  description: `Discussões e recursos sobre ${habilidade.nome} no Reddit`,
                  members: 'Variável',
                  type: 'study'
                },
                {
                  name: `Stack Overflow - ${habilidade.nome}`,
                  platform: 'Stack Overflow',
                  url: `https://stackoverflow.com/search?q=${encodeURIComponent(habilidade.nome)}`,
                  description: `Perguntas e respostas técnicas sobre ${habilidade.nome}`,
                  members: 'Milhões',
                  type: 'study'
                }
              ],
              networking: [
                {
                  name: `LinkedIn - Grupo ${habilidade.nome}`,
                  platform: 'LinkedIn',
                  url: `https://www.linkedin.com/search/results/groups/?keywords=${encodeURIComponent(habilidade.nome)}`,
                  description: `Networking profissional para especialistas em ${habilidade.nome}`,
                  members: 'Variável',
                  type: 'networking'
                },
                {
                  name: `Telegram - ${habilidade.nome} Brasil`,
                  platform: 'Telegram',
                  url: `https://t.me/programadoresbr`,
                  description: `Canal brasileiro sobre ${habilidade.nome}`,
                  members: 'Variável',
                  type: 'networking'
                },
                {
                  name: `Dev.to - ${habilidade.nome}`,
                  platform: 'Dev.to',
                  url: `https://dev.to/search?q=${encodeURIComponent(habilidade.nome)}`,
                  description: `Artigos e discussões sobre ${habilidade.nome}`,
                  members: 'Comunidade global',
                  type: 'networking'
                }
              ],
              forums: [
                {
                  name: `Fórum ${habilidade.nome}`,
                  platform: 'Fórum Especializado',
                  url: `https://www.google.com/search?q=${encodeURIComponent(habilidade.nome + ' fórum brasileiro')}`,
                  description: `Fóruns especializados em ${habilidade.nome}`,
                  members: 'Variável',
                  type: 'forum'
                }
              ]
            },
            
            // 🎓 Cursos e Certificações
            courses: [
              {
                title: `Certificação ${habilidade.nome}`,
                platform: 'Coursera',
                url: `https://www.coursera.org/search?query=${encodeURIComponent(habilidade.nome)}`,
                description: `Cursos certificados em ${habilidade.nome}`,
                duration: 'Variável',
                level: 'Todos os níveis'
              },
              {
                title: `${habilidade.nome} - Udemy`,
                platform: 'Udemy',
                url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(habilidade.nome)}`,
                description: `Cursos práticos de ${habilidade.nome}`,
                duration: 'Variável',
                level: 'Todos os níveis'
              }
            ],
            
            // 📖 Livros e E-books
            books: [
              {
                title: `Livros sobre ${habilidade.nome}`,
                url: `https://www.amazon.com.br/s?k=${encodeURIComponent(habilidade.nome + ' livro')}`,
                description: `Livros recomendados sobre ${habilidade.nome}`,
                type: 'physical'
              },
              {
                title: `E-books ${habilidade.nome}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(habilidade.nome + ' ebook pdf')}`,
                description: `E-books e PDFs gratuitos sobre ${habilidade.nome}`,
                type: 'digital'
              }
            ],
            
            // 🆓 Recursos Gratuitos (URLs reais e funcionais)
            freeResources: [
              {
                title: `FreeCodeCamp - ${habilidade.nome}`,
                url: `https://www.freecodecamp.org/learn/`,
                type: 'course',
                description: `Cursos gratuitos e certificações em programação`
              },
              {
                title: `Codecademy - ${habilidade.nome}`,
                url: `https://www.codecademy.com/catalog/subject/web-development`,
                type: 'interactive',
                description: `Cursos interativos gratuitos de programação`
              },
              {
                title: `Khan Academy - Programação`,
                url: `https://www.khanacademy.org/computing/computer-programming`,
                type: 'course',
                description: `Cursos gratuitos de programação e ciência da computação`
              },
              {
                title: `Coursera - Cursos Gratuitos`,
                url: `https://www.coursera.org/courses?query=${encodeURIComponent(habilidade.nome)}&index=prod_all_launched_products_term_optimization`,
                type: 'course',
                description: `Cursos universitários gratuitos sobre ${habilidade.nome}`
              },
              {
                title: `edX - Cursos Gratuitos`,
                url: `https://www.edx.org/search?q=${encodeURIComponent(habilidade.nome)}`,
                type: 'course',
                description: `Cursos gratuitos de universidades renomadas`
              }
            ]
          }))
        }))
      };
      
      setSkillTreeData(formattedData);
      // Usar generateSkillTree do store ao invés de setSkillTree
      // generateSkillTree será chamado quando necessário
      
      if (onSkillTreeGenerated) {
        onSkillTreeGenerated(formattedData);
      }
      
      playSuccessSound();
      
      logger.info('Árvore de habilidades gerada com sucesso', {
        categorias: (formattedData?.categorias || []).length,
        totalHabilidades: (formattedData?.categorias || []).reduce((sum, cat) => sum + ((cat?.habilidades || []).length), 0)
      });
      
    } catch (error) {
      logger.error('Erro ao gerar árvore de habilidades', error);
      setErrorMessage(`Erro: ${error.message}`);
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-generator-container">
      <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-accent-runic mb-6 flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          Gerador de Árvore de Habilidades IA
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Digite sua carreira ou objetivo profissional:
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Desenvolvedor Frontend, Data Scientist, Designer UX..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-neon focus:border-transparent transition-all duration-200"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  playClickSound();
                  handleGenerateTree();
                }
              }}
            />
          </div>
          
          <button
            onClick={() => {
              playClickSound();
              handleGenerateTree();
            }}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-accent-runic to-accent-neon text-white font-semibold py-3 px-6 rounded-lg hover:from-accent-runic/80 hover:to-accent-neon/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando árvore de habilidades...
              </>
            ) : (
              <>
                <span>✨</span>
                Gerar Árvore de Habilidades
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Exibição da Árvore de Habilidades */}
      {skillTreeData && (
        <div className="mt-6">
          <SkillTreeDisplay data={skillTreeData} />
        </div>
      )}
      
      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 flex items-center gap-2">
            <span>⚠️</span>
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIGenerator;