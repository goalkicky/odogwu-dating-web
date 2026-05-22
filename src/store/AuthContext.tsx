import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../appwrite/config';
import { userService } from '../appwrite/services';
import { UserProfile } from '../types';

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

  const refreshUser = async () => {
    try {
      const user = await account.get();
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
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    setState({ user: null, profile: null, loading: false, isAuthenticated: false, isOnboarded: false });
  };

  const setOnboarded = () => {
    setState(prev => ({ ...prev, isOnboarded: true }));
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser, logout, setOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}
