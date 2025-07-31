import React, { useState } from 'react';
import { ChevronDown, Sparkles, Target, TreePine, BookOpen, Rocket, Trophy, Download, FileText, FileSpreadsheet } from 'lucide-react';
import AIGenerator from '../components/AIGenerator';
import SkillTreeResults from '../components/SkillTreeResults';
import logoOdysseus from '../assets/logo-odysseus.png';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [generatedSkillTree, setGeneratedSkillTree] = useState(null);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleSkillTreeGenerated = (skillTreeData) => {
    setGeneratedSkillTree(skillTreeData);
    // Scroll para a seção de resultados
    setTimeout(() => {
       const resultsSection = document.getElementById('results-section');
       if (resultsSection) {
         resultsSection.scrollIntoView({ behavior: 'smooth' });
       }
     }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-blue-400/30 hover:border-blue-400/60 transition-colors">
                  <img 
                    src={logoOdysseus} 
                    alt="Project Odysseus Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-white">Project Odysseus</span>
              </div>
              <div className="hidden md:flex space-x-8">
                <button onClick={() => scrollToSection('hero')} className="text-gray-300 hover:text-blue-400 transition-colors">A Solução</button>
                <button onClick={() => scrollToSection('gerador')} className="text-gray-300 hover:text-blue-400 transition-colors">Gerador IA ✨</button>
                <button onClick={() => scrollToSection('roadmap')} className="text-gray-300 hover:text-blue-400 transition-colors">Roadmap</button>
                <button onClick={() => scrollToSection('filosofia')} className="text-gray-300 hover:text-blue-400 transition-colors">Filosofia</button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto z-10 mt-16">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            Project <span className="text-blue-400">Odysseus</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Sua carreira não é um jogo.
          </p>
          <p className="text-2xl md:text-3xl text-blue-400 font-semibold mb-12">
            Ou é?
          </p>
          <p className="text-lg md:text-xl text-gray-200 mb-12 leading-relaxed">
            Apresentando o Project Odysseus: Transforme sua jornada profissional em uma aventura épica.
          </p>
          <button 
            onClick={() => scrollToSection('gerador')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            Começar Minha Jornada ✨
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-blue-400" />
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Listas são chatas. Mapas de tesouro, não.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              O desenvolvimento profissional tradicional carece de clareza e motivação. 
              Nós o transformamos em uma experiência visual, progressiva e gratificante.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* O Caminho Antigo */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-red-400 mb-6">O Caminho Antigo</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Listas de tarefas intermináveis
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Falta de direção clara
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Progresso difícil de medir
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Aprendizado isolado e teórico
                </li>
              </ul>
            </div>

            {/* A Jornada Odysseus */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-6">A Jornada Odysseus</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300">
                  <Target className="w-5 h-5 text-blue-400 mr-3" />
                  Objetivo Definido
                </li>
                <li className="flex items-center text-gray-300">
                  <TreePine className="w-5 h-5 text-blue-400 mr-3" />
                  Árvore Gerada
                </li>
                <li className="flex items-center text-gray-300">
                  <BookOpen className="w-5 h-5 text-blue-400 mr-3" />
                  Skill Fundamental
                </li>
                <li className="flex items-center text-gray-300">
                  <Rocket className="w-5 h-5 text-blue-400 mr-3" />
                  Skill Avançada
                </li>
                <li className="flex items-center text-gray-300">
                  <Trophy className="w-5 h-5 text-blue-400 mr-3" />
                  Conquista Épica
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Generator Section */}
      <section id="gerador" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Crie Sua Própria Jornada ✨
            </h2>
            <p className="text-xl text-gray-300">
              Esta é a magia do Odysseus em ação. Digite seu objetivo de carreira e veja a IA construir 
              seu mapa de habilidades personalizado com links para documentação real.
            </p>
          </div>

          <AIGenerator onSkillTreeGenerated={handleSkillTreeGenerated} />
        </div>
      </section>

      {/* Results Section */}
      {generatedSkillTree && (
        <section id="results-section" className="py-20 bg-gray-900/30 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                Sua Jornada Personalizada ✨
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Sua árvore de habilidades foi gerada com sucesso! Explore o mapa e exporte nos formatos que preferir.
              </p>
            </div>
            
            <SkillTreeResults skillTreeData={generatedSkillTree} />
          </div>
        </section>
      )}

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">O Mapa da Jornada</h2>
          <p className="text-xl text-gray-300 mb-12">
            Acompanhe nosso progresso em tempo real. Esta é a saga do desenvolvimento do Project Odysseus, 
            com fases concluídas e as próximas aventuras que nos aguardam.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-green-400 text-2xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Backend</h3>
              <p className="text-gray-300">API e integração com IA concluídas</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-green-400 text-2xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Frontend</h3>
              <p className="text-gray-300">Interface épica e responsiva</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
              <div className="text-blue-400 text-2xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">Exportação</h3>
              <p className="text-gray-300">PDF, Excel e Word formatados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="filosofia" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Nossa Filosofia</h2>
            <blockquote className="text-2xl text-blue-400 italic mb-12">
              "Todo grande mago começou como aprendiz. Todo expert foi iniciante. 
              A diferença está no mapa que seguiram."
            </blockquote>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TreePine className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Visual</h3>
              <p className="text-gray-300">Mapas claros em vez de listas confusas.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Progressivo</h3>
              <p className="text-gray-300">Um passo de cada vez, com base sólida.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Motivador</h3>
              <p className="text-gray-300">Gamificação que celebra cada conquista.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Prático</h3>
              <p className="text-gray-300">Foco em habilidades aplicáveis no mercado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sua Aventura Começa Agora
          </h2>
          <p className="text-xl text-white/90 mb-8">
            O Project Odysseus está sendo forjado. Siga nosso desenvolvimento e prepare-se para iniciar sua jornada!
          </p>
          <button 
            onClick={() => scrollToSection('gerador')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Gerar Meu Mapa Agora ✨
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 border-t border-blue-500/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            Copyright 2025 © João Lucas de Oliveira. Desenvolvido com ⚡ para aprendizado pessoal
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;