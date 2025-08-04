import React, { useState, useEffect } from 'react';
import { exportToPDF, exportToExcel, exportToWord } from '../utils/exportUtils';
import { getEducationalContent } from '../services/youtubeService';
import { playClickSound, playSuccessSound, playErrorSound } from '../utils/soundSystem';

const SkillTreeResults = ({ skillTreeData }) => {
  const [skillsWithContent, setSkillsWithContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  if (!skillTreeData) return null;

  // Carregar conteúdo educacional para cada habilidade
  useEffect(() => {
    const loadEducationalContent = async () => {
      if (!skillTreeData?.categories) return;
      
      setLoadingContent(true);
      const updatedCategories = [];
      
      for (const category of skillTreeData.categories) {
        const updatedSkills = [];
        
        for (const skill of category.skills || []) {
          try {
            const content = await getEducationalContent(skill.name, skillTreeData.goal);
            updatedSkills.push({
              ...skill,
              youtubeContent: content
            });
          } catch (error) {
            console.error(`Erro ao carregar conteúdo para ${skill.name}:`, error);
            updatedSkills.push(skill);
          }
        }
        
        updatedCategories.push({
          ...category,
          skills: updatedSkills
        });
      }
      
      setSkillsWithContent({
        ...skillTreeData,
        categories: updatedCategories
      });
      setLoadingContent(false);
    };
    
    loadEducationalContent();
  }, [skillTreeData]);

  const handleExport = async (format) => {
    try {
      playClickSound();
      switch (format) {
        case 'pdf':
          await exportToPDF(skillsWithContent || skillTreeData);
          break;
        case 'excel':
          await exportToExcel(skillsWithContent || skillTreeData);
          break;
        case 'word':
          await exportToWord(skillsWithContent || skillTreeData);
          break;
        default:
          console.error('Formato de exportação não suportado');
          return;
      }
      playSuccessSound();
    } catch (error) {
      console.error('Erro ao exportar:', error);
      playErrorSound();
      alert('Erro ao exportar o arquivo. Tente novamente.');
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
      {/* Cabeçalho com título e botões de exportação */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            🌳 Jornada para: {skillTreeData.goal}
          </h3>
          <p className="text-gray-400">
            Sua árvore de habilidades personalizada está pronta!
          </p>
        </div>
        
        {/* Botões de Exportação */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <span>📄</span>
            Exportar PDF
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <span>📊</span>
            Exportar Excel
          </button>
          
          <button
            onClick={() => handleExport('word')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <span>📝</span>
            Exportar Word
          </button>
        </div>
      </div>

      {/* Árvore de Habilidades */}
      <div className="space-y-6">
        {skillTreeData.categories?.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
            {/* Nome da Categoria */}
            <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <span>📂</span>
              {category.name}
            </h4>
            
            {/* Lista de Habilidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.skills?.map((skill, skillIndex) => (
                <div
                  key={skillIndex}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-emerald-500/50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 text-lg flex-shrink-0 mt-0.5">🔗</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white mb-2 break-words">
                        {skill.name}
                      </h5>
                      
                      {/* Documentação Oficial */}
                      {skill.url && (
                        <div className="mb-2">
                          <a
                            href={skill.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 break-all"
                          >
                            📚 Documentação Oficial
                          </a>
                        </div>
                      )}
                      
                      {/* Conteúdo do YouTube */}
                      {loadingContent ? (
                        <div className="text-xs text-gray-400 animate-pulse">
                          🔄 Carregando recursos...
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Vídeos */}
                          {skill.youtubeContent?.videos && Array.isArray(skill.youtubeContent.videos) && skill.youtubeContent.videos.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-purple-400 mb-1">🎥 Vídeos Recomendados:</p>
                              {skill.youtubeContent.videos.slice(0, 2).map((video, idx) => (
                                <a
                                  key={idx}
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 truncate"
                                  title={video.title}
                                >
                                  ▶️ {video.title}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          {/* Playlists */}
                          {skill.youtubeContent?.playlists && Array.isArray(skill.youtubeContent.playlists) && skill.youtubeContent.playlists.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-orange-400 mb-1">📚 Playlists Completas:</p>
                              {skill.youtubeContent.playlists.slice(0, 1).map((playlist, idx) => (
                                <a
                                  key={idx}
                                  href={playlist.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-orange-400 hover:text-orange-300 transition-colors duration-200 truncate"
                                  title={playlist.title}
                                >
                                  📋 {playlist.title}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          {/* Repositórios GitHub */}
                          {skill.repositories?.github && Array.isArray(skill.repositories.github) && skill.repositories.github.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-green-400 mb-1">🐙 Repositórios GitHub:</p>
                              {skill.repositories.github.slice(0, 2).map((repo, idx) => (
                                <a
                                  key={idx}
                                  href={repo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-green-400 hover:text-green-300 transition-colors duration-200 truncate"
                                  title={repo.title}
                                >
                                  🔗 {repo.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé com informações */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-400">
            <p>✨ Gerado pelo Project Odysseus</p>
            <p>🌳 {(skillTreeData?.categories || skillTreeData?.categorias || []).reduce((total, cat) => total + ((cat?.skills || cat?.habilidades || []).length), 0)} habilidades mapeadas</p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Copyright 2025 © João Lucas de Oliveira</p>
            <p>Desenvolvido com ⚡ para aprendizado pessoal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeResults;