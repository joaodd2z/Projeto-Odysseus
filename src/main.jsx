import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Initialize sound system
import { initializeSoundSystem } from './utils/soundSystem.js'

// Initialize Firebase
import './services/firebase.js'

// Initialize sound system on app start
initializeSoundSystem().then(() => {
  console.log('🎵 Sound system initialization attempted');
}).catch(err => {
  console.warn('🎵 Sound system initialization failed:', err);
});

// Also try to initialize on window load
window.addEventListener('load', () => {
  setTimeout(() => {
    initializeSoundSystem();
  }, 1000);
});

// Force initialization on first click anywhere
document.addEventListener('click', () => {
  initializeSoundSystem();
}, { once: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)