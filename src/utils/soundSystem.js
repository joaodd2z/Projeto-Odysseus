/**
 * Project Odysseus Sound System
 * Provides immersive audio feedback for user interactions
 * Inspired by console gaming interfaces
 */

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.3;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master volume node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);

      // Generate procedural sounds
      await this.generateSounds();
      
      this.initialized = true;
      console.log('🎵 Sound System initialized');
    } catch (error) {
      console.warn('Sound System initialization failed:', error);
    }
  }

  async generateSounds() {
    // Generate different types of sounds procedurally
    this.sounds.set('hover', this.createHoverSound());
    this.sounds.set('click', this.createClickSound());
    this.sounds.set('skillUnlock', this.createSkillUnlockSound());
    this.sounds.set('skillComplete', this.createSkillCompleteSound());
    this.sounds.set('navigation', this.createNavigationSound());
    this.sounds.set('error', this.createErrorSound());
    this.sounds.set('success', this.createSuccessSound());
    this.sounds.set('ambient', this.createAmbientSound());
  }

  createHoverSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      
      oscillator.type = 'sine';
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    };
  }

  createClickSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
      
      oscillator.type = 'square';
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    };
  }

  createSkillUnlockSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      // Create a more complex sound for skill unlocking
      const playTone = (freq, startTime, duration, type = 'sine') => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = this.audioContext.currentTime;
      playTone(523, now, 0.2); // C5
      playTone(659, now + 0.1, 0.2); // E5
      playTone(784, now + 0.2, 0.3); // G5
    };
  }

  createSkillCompleteSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      // Triumphant chord progression
      const playChord = (frequencies, startTime, duration) => {
        frequencies.forEach(freq => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.masterGain);
          
          oscillator.frequency.setValueAtTime(freq, startTime);
          oscillator.type = 'triangle';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        });
      };
      
      const now = this.audioContext.currentTime;
      playChord([523, 659, 784], now, 0.5); // C Major chord
    };
  }

  createNavigationSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(700, this.audioContext.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
      
      oscillator.type = 'triangle';
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.08);
    };
  }

  createErrorSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      
      oscillator.type = 'sawtooth';
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    };
  }

  createSuccessSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
      
      oscillator.type = 'sine';
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    };
  }

  createAmbientSound() {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      // Subtle ambient drone for background
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 10);
    };
  }

  play(soundName) {
    if (!this.enabled || !this.initialized) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        sound();
      } catch (error) {
        console.warn(`Failed to play sound: ${soundName}`, error);
      }
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

// Create global instance
const soundSystem = new SoundSystem();

// Initialize on user interaction (required by browsers)
let userInteracted = false;

const initializeOnInteraction = async () => {
  if (!userInteracted) {
    userInteracted = true;
    console.log('🎵 Initializing sound system on user interaction...');
    await soundSystem.initialize();
    
    // Remove event listeners after initialization
    document.removeEventListener('click', initializeOnInteraction);
    document.removeEventListener('keydown', initializeOnInteraction);
    document.removeEventListener('touchstart', initializeOnInteraction);
    document.removeEventListener('mousedown', initializeOnInteraction);
    
    console.log('🎵 Sound system ready!');
  }
};

// Add event listeners for user interaction
document.addEventListener('click', initializeOnInteraction, { once: false });
document.addEventListener('keydown', initializeOnInteraction, { once: false });
document.addEventListener('touchstart', initializeOnInteraction, { once: false });
document.addEventListener('mousedown', initializeOnInteraction, { once: false });

// Export functions
export const initializeSoundSystem = async () => {
  // Force initialization if not already done
  if (!soundSystem.initialized) {
    console.log('🎵 Force initializing sound system...');
    await soundSystem.initialize();
  }
};

export const playSound = (soundName) => {
  soundSystem.play(soundName);
};

export const setSoundVolume = (volume) => {
  soundSystem.setVolume(volume);
};

export const toggleSound = () => {
  return soundSystem.toggle();
};

export const enableSound = () => {
  soundSystem.enable();
};

export const disableSound = () => {
  soundSystem.disable();
};

// Convenience functions for common interactions
export const playHoverSound = () => playSound('hover');
export const playClickSound = () => playSound('click');
export const playSkillUnlockSound = () => playSound('skillUnlock');
export const playSkillCompleteSound = () => playSound('skillComplete');
export const playNavigationSound = () => playSound('navigation');
export const playErrorSound = () => playSound('error');
export const playSuccessSound = () => playSound('success');

export default soundSystem;