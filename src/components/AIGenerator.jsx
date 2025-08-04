import { useState } from 'react';

const AIGenerator = ({ onSkillTreeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [skillTreeData, setSkillTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerateTree = async () => {
    // Verificar se o prompt não está vazio
    if (!prompt.trim()) {
      setErrorMessage('Por favor, preencha o objetivo de carreira.');
      return;
    }

    // Verificar se a API key está configurada
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setErrorMessage('API key do Gemini não configurada. Verifique as variáveis de ambiente.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSkillTreeData(null);

    try {
      const payload = {
        contents: [{
          role: "user",
          parts: [{
            text: `Crie uma árvore de habilidades detalhada para o seguinte objetivo de carreira: "${prompt}". 

A árvore deve incluir:
- Categorias principais de habilidades
- Habilidades específicas dentro de cada categoria
- Links úteis para aprender cada habilidade (quando possível)

Organize de forma hierárquica e lógica, priorizando as habilidades mais fundamentais primeiro.`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "objetivo": { "type": "STRING" },
              "categorias": {
                "type": "ARRAY",
                "items": {
                  "type": "OBJECT",
                  "properties": {
                    "nome": { "type": "STRING" },
                    "habilidades": {
                      "type": "ARRAY",
                      "items": {
                        "type": "OBJECT",
                        "properties": {
                          "nome": { "type": "STRING" },
                          "link": { "type": "STRING" }
                        },
                        "required": ["nome"]
                      }
                    }
                  },
                  "required": ["nome", "habilidades"]
                }
              }
            },
            "required": ["objetivo", "categorias"]
          }
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const generatedContent = JSON.parse(result.candidates[0].content.parts[0].text);
        const formattedData = {
          goal: generatedContent.objetivo || prompt,
          categories: generatedContent.categorias?.map(cat => ({
            name: cat.nome,
            skills: cat.habilidades?.map(skill => ({
              name: typeof skill === 'string' ? skill : skill.nome,
              url: typeof skill === 'object' ? skill.link : null
            })) || []
          })) || []
        };
        setSkillTreeData(formattedData);
        if (onSkillTreeGenerated) {
          onSkillTreeGenerated(formattedData);
        }
      } else {
        throw new Error('Resposta da API em formato inesperado');
      }

    } catch (error) {
      console.error('Erro ao gerar árvore de habilidades:', error);
      setErrorMessage(
        error.message.includes('API') 
          ? 'Erro na comunicação com a API. Verifique sua chave de API e tente novamente.'
          : 'Erro ao processar a resposta. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-3">
            Seu Objetivo de Carreira
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Engenheiro de Machine Learning"
            className="w-full px-4 py-4 bg-gray-700 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-lg"
          />
        </div>
        
        <button
          onClick={handleGenerateTree}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-blue-500/25"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Gerando Mapa...
            </span>
          ) : (
            'Gerar Mapa'
          )}
        </button>
      </div>
      
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