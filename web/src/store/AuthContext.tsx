'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, userService } from '@/lib/appwrite/services';
import { UserProfile } from '@/lib/types';

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

interface AuthContextType extends AuthState {
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setOnboarded: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isOnboarded: false,
  refreshUser: async () => {},
  logout: async () => {},
  setOnboarded: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    isOnboarded: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      let profile = null;
      let isOnboarded = false;
      try {
        profile = await userService.getProfile(user.$id) as unknown as UserProfile;
        isOnboarded = true;
      } catch {
        isOnboarded = false;
      }
      setState({ user, profile, loading: false, isAuthenticated: true, isOnboarded });
    } catch {
      setState({ user: null, profile: null, loading: false, isAuthenticated: false, isOnboarded: false });
    }
  }, []);

  const logout = async () => {
    try { await authService.logout(); } catch {}
    setState({ user: null, profile: null, loading: false, isAuthenticated: false, isOnboarded: false });
  };

  const setOnboarded = () => {
    setState(prev => ({ ...prev, isOnboarded: true }));
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!state.user?.$id || !state.isAuthenticated) return;

    const touch = () => userService.updateProfile(state.user.$id, { lastActive: new Date().toISOString() }).catch(() => {});
    const keepalive = () => authService.getCurrentUser().catch(() => {});

    touch();
    keepalive();

    const heartbeatId = setInterval(touch, 30000);
    const sessionKeepaliveId = setInterval(keepalive, 600000);

    return () => { clearInterval(heartbeatId); clearInterval(sessionKeepaliveId); };
  }, [state.user?.$id, state.isAuthenticated]);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser, logout, setOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}
