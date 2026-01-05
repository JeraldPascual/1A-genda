import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserData, createUserDocument, updateUserLastLogin, getUserByEmail } from '../utils/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch additional user data from Firestore
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
        // Update last login
        await updateUserLastLogin(firebaseUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, displayName, role = 'student', batch = null) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile
      await updateProfile(result.user, { displayName });

      // Create user document in Firestore
      const userData = {
        email,
        displayName,
        role,
        photoURL: result.user.photoURL || '',
      };

      // Add batch for students only
      if (role === 'student' && batch) {
        userData.batch = batch;
      }

      const createResult = await createUserDocument(result.user.uid, userData);

      if (!createResult.success) {
        console.error('Failed to create user document:', createResult.error);
      }

      // Fetch the newly created user data
      const userDataFetched = await getUserData(result.user.uid);
      setUserData(userDataFetched);

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
