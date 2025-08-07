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
import { createLogger } from '../utils/logger';
import { handleError, AuthenticationError, NetworkError, withErrorHandling } from '../utils/errorHandler';
import { validateUserInput } from '../utils/validators';

const logger = createLogger('Auth', { enablePerformance: true });

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
  const signUp = withErrorHandling('Auth', 'HIGH')(async (email, password, displayName) => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      
      // Validate all inputs
      const emailValidation = validateUserInput(email, { type: 'email' });
      const passwordValidation = validateUserInput(password, { type: 'password' });
      const nameValidation = validateUserInput(displayName, { type: 'displayName' });
      
      if (!emailValidation.isValid) {
        throw new AuthenticationError(
          emailValidation.getFirstError()?.message || 'Invalid email format',
          'validation',
          { field: 'email' }
        );
      }
      
      if (!passwordValidation.isValid) {
        throw new AuthenticationError(
          passwordValidation.getFirstError()?.message || 'Invalid password format',
          'validation',
          { field: 'password' }
        );
      }
      
      if (displayName && !nameValidation.isValid) {
        throw new AuthenticationError(
          nameValidation.getFirstError()?.message || 'Invalid display name format',
          'validation',
          { field: 'displayName' }
        );
      }
      
      logger.info('Starting user registration', {
        email: email.substring(0, 3) + '***',
        hasDisplayName: !!displayName
      });
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      logger.performance('firebase_auth_register', performance.now() - startTime);
      
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
          soundEnabled: true,
          theme: 'dark'
        },
        stats: {
          totalSkillsCompleted: 0,
          totalCareersExplored: 0,
          currentStreak: 0,
          longestStreak: 0,
        }
      };
      
      const firestoreStartTime = performance.now();
      await setDoc(doc(db, 'users', user.uid), userProfile);
      logger.performance('firestore_user_create', performance.now() - firestoreStartTime);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: 'Welcome to Odysseus!',
        message: `Account created successfully. Welcome aboard, ${displayName}! 🚀`
      });
      
      logger.info('User registration successful', {
        uid: user.uid,
        email: email.substring(0, 3) + '***',
        displayName: displayName || 'none',
        totalDuration: performance.now() - startTime
      });
      
      return { success: true, user };
      
    } catch (error) {
      const handledError = await handleError(error, {
        retryFunction: () => signUp(email, password, displayName),
        fallbackData: null
      });
      
      logger.error('User registration failed', handledError, {
        email: email.substring(0, 3) + '***',
        errorCode: error.code,
        duration: performance.now() - startTime
      });
      
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
          errorMessage = handledError.message || error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  });
  
  // Sign in with email and password
  const signIn = withErrorHandling('Auth', 'HIGH')(async (email, password) => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      
      // Validate input
      const emailValidation = validateUserInput(email, { type: 'email' });
      const passwordValidation = validateUserInput(password, { type: 'password' });
      
      if (!emailValidation.isValid) {
        throw new AuthenticationError(
          emailValidation.getFirstError()?.message || 'Invalid email format',
          'validation',
          { field: 'email' }
        );
      }
      
      if (!passwordValidation.isValid) {
        throw new AuthenticationError(
          passwordValidation.getFirstError()?.message || 'Invalid password format',
          'validation',
          { field: 'password' }
        );
      }
      
      logger.info('Starting user login', { email: email.substring(0, 3) + '***' });
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      logger.performance('firebase_auth_login', performance.now() - startTime);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'success',
        title: 'Welcome back!',
        message: `Successfully signed in. Ready to continue your journey? ⚔️`
      });
      
      logger.info('User login successful', {
        uid: user.uid,
        email: email.substring(0, 3) + '***',
        totalDuration: performance.now() - startTime
      });
      
      return { success: true, user };
      
    } catch (error) {
      const handledError = await handleError(error, {
        retryFunction: () => signIn(email, password),
        fallbackData: null
      });
      
      logger.error('User login failed', handledError, {
        email: email.substring(0, 3) + '***',
        errorCode: error.code,
        duration: performance.now() - startTime
      });
      
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
          errorMessage = handledError.message || error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  });
  
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
  const logout = withErrorHandling('Auth', 'MEDIUM')(async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      
      logger.info('Starting user logout');
      
      await signOut(auth);
      
      if (soundEnabled) playSuccessSound();
      
      setNotification({
        type: 'info',
        title: 'Signed out',
        message: 'You have been successfully signed out. See you soon! 👋'
      });
      
      logger.performance('firebase_auth_logout', performance.now() - startTime);
      logger.info('User logout successful', {
        duration: performance.now() - startTime
      });
      
      return { success: true };
      
    } catch (error) {
      const handledError = await handleError(error, {
        retryFunction: () => logout(),
        fallbackData: null
      });
      
      logger.error('User logout failed', handledError, {
        duration: performance.now() - startTime
      });
      
      if (soundEnabled) playErrorSound();
      
      setError(handledError.message || 'Failed to sign out');
      return { success: false, error: handledError.message || error.message };
    } finally {
      setLoading(false);
    }
  });
  
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