import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check local storage saved user session
    const savedUser = localStorage.getItem('study_hub_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const login = async (email, password) => {
    const trimmedEmail = (email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address (e.g. admin@studyhub.com).' };
    }

    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    try {
      const res = await loginApi({ email: trimmedEmail, password });
      if (res && res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('study_hub_user', JSON.stringify(res.user));
        setShowAuthModal(false);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid admin credentials.' };
    } catch (err) {
      return { success: false, error: 'Failed to connect to authentication server.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('study_hub_user');
  };

  const requireAuth = (callback) => {
    if (user) {
      if (typeof callback === 'function') callback();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, showAuthModal, setShowAuthModal, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
