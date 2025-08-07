import React, { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import ToolsLayerModal from './ToolsLayerModal';
import { useToolsLayer } from '../../hooks/useToolsLayer';

const ToolsLayerButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { isOpen, openModal, closeModal } = useToolsLayer();

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openModal}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white p-4 rounded-full shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
          aria-label="Abrir Odysseus Tools Layer"
        >
          {/* Efeito de brilho */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          {/* Partículas flutuantes */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white rounded-full opacity-60 transition-all duration-1000 ${
                  isHovered ? 'animate-ping' : ''
                }`}
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${20 + (i * 8)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
          
          {/* Ícone principal */}
          <div className="relative z-10 flex items-center justify-center">
            <Brain className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-accent-300 opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Tooltip */}
          <div className={`absolute right-full mr-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <div className="bg-dark-800/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-primary-500/30 shadow-xl">
              🧠 A Peneira das IA's
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-dark-800/95 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </div>
          </div>
        </button>
        
        {/* Indicador de pulso */}
        <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
        <div className="absolute inset-0 rounded-full bg-primary-500 animate-pulse opacity-10" />
      </div>

      {/* Modal */}
      <ToolsLayerModal 
        isOpen={isOpen} 
        onClose={closeModal} 
      />

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .group:hover {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default ToolsLayerButton;