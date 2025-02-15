'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { useRouter } from 'next/navigation';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      setUser({ email });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await storage.login(email, password);
      if (data.token) {
        setUser({ email });
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const data = await storage.register(email, password);
      if (data.token) {
        setUser({ email });
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.logout();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
