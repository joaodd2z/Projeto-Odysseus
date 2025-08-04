import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import { playSkillUnlockSound, playSkillCompleteSound } from '../utils/soundSystem';

// Main application store
export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      isLoading: false,
      error: null,
      notification: null,
      sidebarOpen: false,
      theme: 'dark',
      soundEnabled: true,
      
      // User State
      user: null,
      isAuthenticated: false,
      userProgress: {},
      userPreferences: {
        preferredLearningStyle: 'visual',
        difficultyLevel: 'intermediate',
        timeCommitment: 'moderate',
      },
      
      // Skill Tree State
      currentCareer: null,
      skillTree: null,
      selectedSkill: null,
      availableCareers: [],
      
      // Progress State
      completedSkills: new Set(),
      totalSkills: 0,
      progressPercentage: 0,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      setNotification: (notification) => {
        set({ notification });
        // Auto-clear notification after 5 seconds
        setTimeout(() => {
          set({ notification: null });
        }, 5000);
      },
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      
      // User Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        userProgress: {},
        skillTree: null,
        currentCareer: null,
        completedSkills: new Set(),
      }),
      
      // Career and Skill Tree Actions
      async loadAvailableCareers() {
        try {
          set({ isLoading: true, error: null });
          const response = await apiService.getAvailableCareers();
          set({ availableCareers: response.careers });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      async loadSkillTree(careerName) {
        try {
          set({ isLoading: true, error: null });
          
          // Get skill tree
          const skillTree = await apiService.getSkillTree(careerName);
          
          // Get user progress if authenticated
          let userProgress = {};
          if (get().isAuthenticated) {
            try {
              const progressResponse = await apiService.getUserProgress();
              userProgress = progressResponse.progress || {};
            } catch (progressError) {
              console.warn('Failed to load user progress:', progressError);
            }
          }
          
          // Update skill tree with user progress
          const updatedSkills = skillTree.skills.map(skill => ({
            ...skill,
            completed: userProgress[skill.id]?.completed || false,
            proof_link: userProgress[skill.id]?.proof_link || null,
          }));
          
          const updatedSkillTree = {
            ...skillTree,
            skills: updatedSkills,
          };
          
          // Calculate progress
          const completedSkills = new Set(
            updatedSkills.filter(skill => skill.completed).map(skill => skill.id)
          );
          
          const progressPercentage = updatedSkills.length > 0 
            ? (completedSkills.size / updatedSkills.length) * 100 
            : 0;
          
          set({
            currentCareer: careerName,
            skillTree: updatedSkillTree,
            userProgress,
            completedSkills,
            totalSkills: updatedSkills.length,
            progressPercentage,
          });
          
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      async generateSkillTree(careerRequest) {
        try {
          set({ isLoading: true, error: null });
          const skillTree = await apiService.generateSkillTree(careerRequest);
          
          set({
            currentCareer: careerRequest.career_name,
            skillTree,
            totalSkills: skillTree.skills.length,
            progressPercentage: 0,
            completedSkills: new Set(),
          });
          
          return skillTree;
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Skill Progress Actions
      async completeSkill(skillId, proofLink = null) {
        try {
          const state = get();
          
          if (!state.isAuthenticated) {
            throw new Error('You must be logged in to save progress');
          }
          
          // Update API
          await apiService.completeSkill(skillId, proofLink);
          
          // Update local state
          const updatedSkills = state.skillTree.skills.map(skill => 
            skill.id === skillId 
              ? { ...skill, completed: true, proof_link: proofLink }
              : skill
          );
          
          const newCompletedSkills = new Set([...state.completedSkills, skillId]);
          const progressPercentage = (newCompletedSkills.size / state.totalSkills) * 100;
          
          set({
            skillTree: { ...state.skillTree, skills: updatedSkills },
            completedSkills: newCompletedSkills,
            progressPercentage,
            userProgress: {
              ...state.userProgress,
              [skillId]: { completed: true, proof_link: proofLink }
            }
          });
          
          // Play sound effect
          if (state.soundEnabled) {
            playSkillCompleteSound();
          }
          
          // Check for newly unlocked skills
          get().checkUnlockedSkills();
          
          // Show notification
          const skill = updatedSkills.find(s => s.id === skillId);
          set({ 
            notification: {
              type: 'success',
              title: 'Skill Completed!',
              message: `You've mastered "${skill?.name}"! 🎉`
            }
          });
          
        } catch (error) {
          set({ error: error.message });
        }
      },
      
      async uncompleteSkill(skillId) {
        try {
          const state = get();
          
          if (!state.isAuthenticated) {
            throw new Error('You must be logged in to save progress');
          }
          
          // Update API
          await apiService.uncompleteSkill(skillId);
          
          // Update local state
          const updatedSkills = state.skillTree.skills.map(skill => 
            skill.id === skillId 
              ? { ...skill, completed: false, proof_link: null }
              : skill
          );
          
          const newCompletedSkills = new Set(state.completedSkills);
          newCompletedSkills.delete(skillId);
          
          const progressPercentage = (newCompletedSkills.size / state.totalSkills) * 100;
          
          set({
            skillTree: { ...state.skillTree, skills: updatedSkills },
            completedSkills: newCompletedSkills,
            progressPercentage,
            userProgress: {
              ...state.userProgress,
              [skillId]: { completed: false, proof_link: null }
            }
          });
          
        } catch (error) {
          set({ error: error.message });
        }
      },
      
      checkUnlockedSkills() {
        const state = get();
        if (!state.skillTree) return;
        
        const newlyUnlocked = [];
        
        state.skillTree.skills.forEach(skill => {
          if (!skill.completed && !skill.wasLocked) {
            const canUnlock = skill.dependencies.every(depId => 
              state.completedSkills.has(depId)
            );
            
            if (canUnlock && skill.dependencies.length > 0) {
              newlyUnlocked.push(skill);
              skill.wasLocked = false; // Mark as previously locked
            }
          }
        });
        
        // Play unlock sound for newly unlocked skills
        if (newlyUnlocked.length > 0 && state.soundEnabled) {
          playSkillUnlockSound();
          
          // Show notification for unlocked skills
          const skillNames = newlyUnlocked.map(s => s.name).join(', ');
          set({ 
            notification: {
              type: 'info',
              title: 'New Skills Unlocked!',
              message: `You can now learn: ${skillNames} 🔓`
            }
          });
        }
      },
      
      // Skill Selection
      setSelectedSkill: (skill) => set({ selectedSkill: skill }),
      
      clearSelectedSkill: () => set({ selectedSkill: null }),
      
      // Utility Functions
      isSkillUnlocked(skillId) {
        const state = get();
        if (!state.skillTree) return false;
        
        const skill = state.skillTree.skills.find(s => s.id === skillId);
        if (!skill) return false;
        
        // Skills with no dependencies are always unlocked
        if (skill.dependencies.length === 0) return true;
        
        // Check if all dependencies are completed
        return skill.dependencies.every(depId => 
          state.completedSkills.has(depId)
        );
      },
      
      getSkillById(skillId) {
        const state = get();
        return state.skillTree?.skills.find(s => s.id === skillId) || null;
      },
      
      getProgressStats() {
        const state = get();
        return {
          completed: state.completedSkills.size,
          total: state.totalSkills,
          percentage: state.progressPercentage,
          remaining: state.totalSkills - state.completedSkills.size,
        };
      },
    }),
    {
      name: 'odysseus-app-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        userPreferences: state.userPreferences,
        currentCareer: state.currentCareer,
      }),
    }
  )
);

// Selectors for better performance
export const useSkillTree = () => useAppStore(state => state.skillTree);
export const useCurrentCareer = () => useAppStore(state => state.currentCareer);
export const useProgressStats = () => useAppStore(state => state.getProgressStats());
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const useUser = () => useAppStore(state => state.user);
export const useSelectedSkill = () => useAppStore(state => state.selectedSkill);
export const useNotification = () => useAppStore(state => state.notification);
export const useError = () => useAppStore(state => state.error);
export const useIsLoading = () => useAppStore(state => state.isLoading);

export default useAppStore;