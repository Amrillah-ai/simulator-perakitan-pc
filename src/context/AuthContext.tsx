import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  saveResultToCloud: (resultData: {
    studentName: string;
    studentClass: string;
    scenarioId: string;
    scenarioTitle: string;
    scoreTotal: number;
    scoreSop: number;
    scoreSafety: number;
    scoreAccuracy: number;
    scorePost: number;
    timeSpentSeconds: number;
    grade: string;
    feedback?: string;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
  saveResultToCloud: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch('/api/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error('Failed to sync user with database:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const saveResultToCloud = async (resultData: {
    studentName: string;
    studentClass: string;
    scenarioId: string;
    scenarioTitle: string;
    scoreTotal: number;
    scoreSop: number;
    scoreSafety: number;
    scoreAccuracy: number;
    scorePost: number;
    timeSpentSeconds: number;
    grade: string;
    feedback?: string;
  }): Promise<boolean> => {
    try {
      const token = await getIdToken();
      if (!token) return false;

      const res = await fetch('/api/exam-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
      });

      return res.ok;
    } catch (err) {
      console.error('Failed to save exam result to Cloud SQL:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
        getIdToken,
        saveResultToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
