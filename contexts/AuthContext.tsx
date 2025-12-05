'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import type { UserRole } from '@/lib/types';

interface AuthContextType {
  user: { username: string; role: UserRole } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string; role: UserRole } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current user from backend
    const checkCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.status === 'SUCCESS' && response.username && response.role) {
          // Normalize role format (ROLE_ADMIN -> ADMIN, ROLE_MANAGER -> MANAGER, ROLE_USER -> USER)
          let normalizedRole = response.role;
          if (normalizedRole.startsWith('ROLE_')) {
            normalizedRole = normalizedRole.replace('ROLE_', '');
          }
          
          const userData = { username: response.username, role: normalizedRole };
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
          sessionStorage.removeItem('user');
        }
      } catch (error) {
        // If /auth/current fails, clear user data
        setUser(null);
        sessionStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentUser();

    // Listen for auth updates from API client
    const handleAuthUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.username && event.detail.role) {
        const userData = { username: event.detail.username, role: event.detail.role };
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
    };

    window.addEventListener('auth-update', handleAuthUpdate as EventListener);

    return () => {
      window.removeEventListener('auth-update', handleAuthUpdate as EventListener);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      if (response.status === 'SUCCESS') {
        // Normalize role format (ROLE_ADMIN -> ADMIN, ROLE_MANAGER -> MANAGER, ROLE_USER -> USER)
        let normalizedRole = response.role;
        if (normalizedRole.startsWith('ROLE_')) {
          normalizedRole = normalizedRole.replace('ROLE_', '');
        }
        
        const userData = { username: response.username, role: normalizedRole };
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error: any) {
      // Re-throw with more context
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
