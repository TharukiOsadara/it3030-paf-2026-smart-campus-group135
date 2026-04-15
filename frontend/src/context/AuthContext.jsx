import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Auth context provider — fetches and holds the current user state.
 * Wraps the app to provide authentication info to all components.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = () => fetchUser();

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access current auth state.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
