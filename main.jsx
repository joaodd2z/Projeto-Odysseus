import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Initialize sound system
import { initializeSoundSystem } from './utils/soundSystem.js'

// Initialize Firebase
import './services/firebase.js'

// Initialize sound system on app start
initializeSoundSystem()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)