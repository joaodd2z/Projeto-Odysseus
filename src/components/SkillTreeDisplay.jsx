import React from 'react';

const SkillTreeDisplay = ({ data }) => {
  if (!data || (!data.categorias && !data.categories)) {
    return null;
  }

  // Suportar tanto o formato antigo quanto o novo
  const categories = data.categories || data.categorias || [];
  const goal = data.goal || data.objetivo || '';
  const description = data.description || data.descricao || '';

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-accent-runic mb-2">
          🎯 Objetivo: {goal}
        </h3>
        {description && (
          <p className="text-gray-400 text-sm mb-3">{description}</p>
        )}
        <div className="h-px bg-gradient-to-r from-accent-runic via-accent-neon to-transparent"></div>
      </div>
      
      <div className="space-y-6">
        {categories.map((category, categoryIndex) => {
          const categoryName = category.name || category.nome || '';
          const skills = category.skills || category.habilidades || [];
          
          return (
            <div key={categoryIndex} className="skill-category">
              <h4 className="text-lg font-semibold text-accent-neon mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent-neon rounded-full animate-pulse"></span>
                {categoryName}
              </h4>
              
              <ul className="space-y-2 ml-4">
                {skills.map((skill, skillIndex) => {
                  const skillName = skill.name || skill.nome || '';
                  const skillUrl = skill.url || skill.link || null;
                  
                  return (
                    <li key={skillIndex} className="generated-skill-node">
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:border-accent-neon/50 transition-all duration-200 group">
                        <div className="w-1.5 h-1.5 bg-accent-runic rounded-full group-hover:bg-accent-neon transition-colors duration-200"></div>
                        
                        {skillUrl ? (
                          <a
                            href={skillUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-gray-200 hover:text-accent-neon transition-colors duration-200 flex items-center gap-2 group"
                          >
                            <span className="flex-1">{skillName}</span>
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
                            {skillName}
                          </span>
                        )}
                        
                        {/* Indicadores de conteúdo disponível */}
                        <div className="flex items-center gap-1 text-xs">
                          {skill.documentation && skill.documentation.length > 0 && (
                            <span className="text-blue-400" title="Documentação disponível">📚</span>
                          )}
                          {skill.youtubeContent && skill.youtubeContent.videos && skill.youtubeContent.videos.length > 0 && (
                            <span className="text-red-400" title="Vídeos disponíveis">🎥</span>
                          )}
                          {skill.youtubeContent && skill.youtubeContent.playlists && skill.youtubeContent.playlists.length > 0 && (
                            <span className="text-purple-400" title="Playlists disponíveis">📋</span>
                          )}
                          {skill.youtubeContent && skill.youtubeContent.shorts && skill.youtubeContent.shorts.length > 0 && (
                            <span className="text-yellow-400" title="Shorts disponíveis">⚡</span>
                          )}
                          {skill.communities && (
                            (skill.communities?.study && skill.communities.study.length > 0) ||
                            (skill.communities?.networking && skill.communities.networking.length > 0) ||
                            (skill.communities?.forums && skill.communities.forums.length > 0)
                          ) && (
                            <span className="text-green-400" title="Comunidades disponíveis">🌐</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
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