'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getProfile, logout as authLogout, isAuthenticated } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    if (isAuthenticated()) {
      const profile = await getProfile();
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const refresh = () => {
    checkAuth();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    updateUser,
    refresh
  };
}