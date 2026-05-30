import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('hiru-admin-token'));
  const [email, setEmail] = useState(() => sessionStorage.getItem('hiru-admin-email'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/api/auth/me')
      .then((res) => {
        setEmail(res.data.email);
        sessionStorage.setItem('hiru-admin-email', res.data.email);
      })
      .catch(() => {
        setToken(null);
        setEmail(null);
        sessionStorage.removeItem('hiru-admin-token');
        sessionStorage.removeItem('hiru-admin-email');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    sessionStorage.setItem('hiru-admin-token', res.data.token);
    sessionStorage.setItem('hiru-admin-email', res.data.email);
    setToken(res.data.token);
    setEmail(res.data.email);
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem('hiru-admin-token');
    sessionStorage.removeItem('hiru-admin-email');
    setToken(null);
    setEmail(null);
  };

  const updateSession = (nextToken, nextEmail) => {
    if (nextToken) {
      sessionStorage.setItem('hiru-admin-token', nextToken);
      setToken(nextToken);
    }
    if (nextEmail) {
      sessionStorage.setItem('hiru-admin-email', nextEmail);
      setEmail(nextEmail);
    }
  };

  const value = useMemo(
    () => ({
      token,
      email,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateSession,
    }),
    [token, email, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
