import { createContext, useEffect, useState } from 'react';

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
    // позже заменить на запрос к GoLang API
    const newUser = { email };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const register = async (email, password) => {
    const newUser = { email };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
