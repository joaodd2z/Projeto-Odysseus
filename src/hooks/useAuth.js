import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useAppStore } from '../stores/useAppStore';
import { playSuccessSound, playErrorSound } from '../utils/soundSystem';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { setUser, setError, setNotification, soundEnabled } = useAppStore();
  
  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          const userProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData.displayName || '',
            photoURL: user.photoURL || userData.photoURL || '',
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            preferences: userData.preferences || {
              preferredLearningStyle: 'visual',
              difficultyLevel: 'intermediate',
              timeCommitment: 'moderate',
            },
            stats: userData.stats || {
              totalSkillsCompleted: 0,
              totalCareersExplored: 0,
              currentStreak: 0,
              longestStreak: 0,
            }
          };
          
          // Update user document in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            ...userProfile,
            lastLoginAt: new Date().toISOString(),
          }, { merge: true });
          
          setUser(userProfile);
        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Failed to load user profile');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, [setUser, setError]);
  
  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          preferredLearningStyle: 'visual',
          difficultyLevel: 'intermediate',
          timeCommitment: 'moderate',
        },
        stats: {
          totalSkillsCompleted: 0,
          totalCareersExplored: 0,
          currentStreak: 0,
          longestStreak: 0,
        }
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: 'Welcome to Odysseus!',
        message: `Account created successfully. Welcome aboard, ${displayName}! 🚀`
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      
      if (soundEnabled) playErrorSound();
      
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: 'Welcome back!',
        message: `Successfully signed in. Ready to continue your journey? ⚔️`
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      
      if (soundEnabled) playErrorSound();
      
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if this is a new user
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isNewUser = !userDoc.exists();
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: isNewUser ? 'Welcome to Odysseus!' : 'Welcome back!',
        message: isNewUser 
          ? `Account created with Google. Welcome aboard! 🚀`
          : `Successfully signed in with Google. Ready to continue? ⚔️`
      });
      
      return { success: true, user, isNewUser };
    } catch (error) {
      console.error('Google sign in error:', error);
      
      if (soundEnabled) playErrorSound();
      
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      
      await signOut(auth);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'info',
        title: 'Signed out',
        message: 'You have been successfully signed out. See you soon! 👋'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      
      if (soundEnabled) playErrorSound();
      
      setError('Failed to sign out');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      
      await sendPasswordResetEmail(auth, email);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: 'Password reset sent',
        message: 'Check your email for password reset instructions 📧'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (soundEnabled) playErrorSound();
      
      let errorMessage = 'Failed to send password reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      // Update Firebase Auth profile if needed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: updates.displayName,
          photoURL: updates.photoURL,
        });
      }
      
      // Update Firestore document
      await setDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been successfully updated ✨'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (soundEnabled) playErrorSound();
      
      setError('Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  };
};

export default useAuth;