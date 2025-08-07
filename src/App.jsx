import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ParticleSystem from './components/ui/ParticleSystem';
import { ToolsLayerButton } from './components/toolsLayer';

// Pages
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-dark-900 relative">
          {/* Sistema de Partículas Otimizadas */}
          <ParticleSystem 
            enabled={true}
            intensity="low" 
            colorScheme="primary" 
            style={{ zIndex: 999, position: 'fixed' }} 
          />
          
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          
          {/* Odysseus Tools Layer - A Peneira das IA's */}
          <ToolsLayerButton />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;