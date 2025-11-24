import { createContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';
import { endpoints } from '../services/endpoints';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch(endpoints.auth.login(), { method: 'POST', body: { email, password } });
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      const newUser = { email: res.email || email, id: res.user_id };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (email, password) => {
    await apiFetch(endpoints.auth.register(), { method: 'POST', body: { email, password } });

    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
