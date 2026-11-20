'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import API from '../lib/api';
import { getStoredToken, getStoredUser, setAuthData, clearAuthData } from '../lib/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isSuperAdmin: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => { },
});

const PUBLIC_ROUTES = ['/login', '/register', '/'];

const isPublicPath = (path) =>
  PUBLIC_ROUTES.some((route) => path === route || (route !== '/' && path.startsWith(`${route}/`)));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const resetSession = useCallback(() => {
    setToken(null);
    setUser(null);
    clearAuthData();
  }, []);

  // ── Restore & VERIFY the session with the server on first load ──────────
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await API.get('/auth/me');
        if (cancelled) return;
        const freshUser = res.data.data;
        setToken(storedToken);
        setUser(freshUser);
        setAuthData(storedToken, freshUser);
      } catch (error) {
        if (cancelled) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          resetSession();
        } else {
          // If network or cold start, use cached user temporarily
          const cachedUser = getStoredUser();
          if (cachedUser) {
            setToken(storedToken);
            setUser(cachedUser);
          } else {
            resetSession();
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();
    return () => { cancelled = true; };
  }, [resetSession]);

  // ── Auto sign-out when any API call reports an invalid / revoked session ─
  useEffect(() => {
    const handleUnauthorized = () => {
      resetSession();
      router.replace('/login');
    };
    window.addEventListener('ws:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ws:unauthorized', handleUnauthorized);
  }, [resetSession, router]);

  // ── Route protection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !pathname) return;

    const isPublicRoute = isPublicPath(pathname);

    if (!token && !isPublicRoute) {
      router.replace('/login');
    } else if (token && (pathname === '/login' || pathname === '/register')) {
      router.replace('/dashboard/discover');
    }
  }, [token, pathname, loading, router]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = res.data.data;

      setToken(userToken);
      setUser(userData);
      setAuthData(userToken, userData);

      router.push('/dashboard/discover');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        code: error.response?.data?.code,
        reason: error.response?.data?.reason,
        error: error.response?.data?.message || 'Unable to sign in. Please check your connection and try again.',
      };
    }
  };

  // Registration never signs the user in — a super admin must approve first.
  const register = async (payload) => {
    try {
      const res = await API.post('/auth/register', payload);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    resetSession();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isSuperAdmin: user?.role === 'super_admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
