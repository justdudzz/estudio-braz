import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name?: string;
  tier?: string;
  points?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('braz_token');
    const savedUser = localStorage.getItem('braz_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (data: any) => {
    // Suporta tanto a estrutura de admin como a de client do backend
    const userData = data.user || data.client;
    const userRole = data.user ? 'admin' : 'client';
    
    const finalUser: User = { ...userData, role: userRole };
    
    setToken(data.token);
    setUser(finalUser);
    localStorage.setItem('braz_token', data.token);
    localStorage.setItem('braz_user', JSON.stringify(finalUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('braz_token');
    localStorage.removeItem('braz_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};