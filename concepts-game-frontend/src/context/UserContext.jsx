import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const UserContext = createContext(null);

const STORAGE_KEY = 'concepts_user';
const TOKEN_KEY = 'concepts_token';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user on mount -- verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // Call /auth/me to verify token + get fresh user data
      authApi.me()
        .then((u) => {
          setUser(u);
          setLoading(false);
        })
        .catch(() => {
          // Token expired or invalid -- clean up
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { token, user: userData } = await authApi.register(username, email, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: userData } = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData; 
  }, []);

  // ← NEW: Google login
  const loginWithGoogle = useCallback(async (credential) => {
    const { token, user: userData } = await authApi.google(credential);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);
    
  return (
    <UserContext.Provider value = {{ user, loading, register, login, loginWithGoogle, logout }}>
      { children }
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
};