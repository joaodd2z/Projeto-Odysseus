import React from 'react';

const SkillTreeDisplay = ({ data }) => {
  if (!data || !data.categorias) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-accent-runic mb-2">
          🎯 Objetivo: {data.objetivo}
        </h3>
        <div className="h-px bg-gradient-to-r from-accent-runic via-accent-neon to-transparent"></div>
      </div>
      
      <div className="space-y-6">
        {data.categorias.map((categoria, categoriaIndex) => (
          <div key={categoriaIndex} className="skill-category">
            <h4 className="text-lg font-semibold text-accent-neon mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-neon rounded-full animate-pulse"></span>
              {categoria.nome}
            </h4>
            
            <ul className="space-y-2 ml-4">
              {categoria.habilidades.map((habilidade, habilidadeIndex) => (
                <li key={habilidadeIndex} className="generated-skill-node">
                  <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:border-accent-neon/50 transition-all duration-200 group">
                    <div className="w-1.5 h-1.5 bg-accent-runic rounded-full group-hover:bg-accent-neon transition-colors duration-200"></div>
                    
                    {habilidade.link ? (
                      <a
                        href={habilidade.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-gray-200 hover:text-accent-neon transition-colors duration-200 flex items-center gap-2 group"
                      >
                        <span className="flex-1">{habilidade.nome}</span>
                        <svg 
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                          />
                        </svg>
                      </a>
                    ) : (
                      <span className="flex-1 text-gray-200">
                        {habilidade.nome}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-600">
        <p className="text-sm text-gray-400 text-center">
          💡 Clique nos links para acessar recursos de aprendizado
        </p>
      </div>
    </div>
  );
};

export default SkillTreeDisplay;