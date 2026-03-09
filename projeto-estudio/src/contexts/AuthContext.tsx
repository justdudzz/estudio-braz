import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name?: string;
  tier?: string;
  points?: number;
  isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Carregar utilizador do localStorage (apenas dados, NÃO o token) (#1)
  useEffect(() => {
    const savedUser = localStorage.getItem('braz_user');
    const expiresAt = localStorage.getItem('braz_expires_at');

    if (savedUser && expiresAt) {
      // Verificar se a sessão ainda não expirou (#2)
      if (Date.now() < parseInt(expiresAt, 10)) {
        setUser(JSON.parse(savedUser));
      } else {
        // Token expirado — limpar dados
        localStorage.removeItem('braz_user');
        localStorage.removeItem('braz_expires_at');
      }
    }
  }, []);

  const login = (data: any) => {
    // O backend envia { user: {...}, expiresAt } — SEM token no body (#1)
    const userData = data.user;

    const finalUser: User = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      tier: userData.tier,
      points: userData.points,
      isTwoFactorEnabled: userData.isTwoFactorEnabled,
    };

    setUser(finalUser);
    // Guardar apenas dados do user e expiração (NÃO o token!) (#1, #2)
    localStorage.setItem('braz_user', JSON.stringify(finalUser));
    localStorage.setItem('braz_expires_at', String(data.expiresAt));
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('braz_user', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      // Chamar o servidor para limpar o cookie httpOnly (#13)
      await api.post('/auth/logout');
    } catch (err) {
      // Se falhar o request, limpar localmente mesmo assim
      console.error('Erro ao fazer logout no servidor:', err);
    }

    setUser(null);
    localStorage.removeItem('braz_user');
    localStorage.removeItem('braz_expires_at');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      updateUser,
      logout,
      isAuthenticated: !!user,
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
