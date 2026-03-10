import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN_STAFF' | 'ACCOUNTANT' | 'CLIENT';
  name?: string;
  displayName?: string;
  photoUrl?: string;
  tier?: string;
  points?: number;
  clientId?: string;
  isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isAccountant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Carregar utilizador e validar sessão (#1, #2)
  useEffect(() => {
    const validateSession = async () => {
      const savedUser = localStorage.getItem('braz_user');
      const expiresAt = localStorage.getItem('braz_expires_at');

      if (savedUser && expiresAt) {
        if (Date.now() < parseInt(expiresAt, 10)) {
          // Temporariamente definimos o que temos no localStorage
          const localUser = JSON.parse(savedUser);
          setUser(localUser);

          try {
            // Validamos com o servidor para garantir que o cookie ainda é válido
            const response = await api.get('/auth/me');
            setUser(response.data.user);
            localStorage.setItem('braz_user', JSON.stringify(response.data.user));
          } catch (err: any) {
            console.warn('Sessão expirada ou inválida no servidor.');
            if (err.response?.status === 401) {
              logoutLocal();
            }
          }
        } else {
          logoutLocal();
        }
      }
    };

    validateSession();
  }, []);

  const logoutLocal = () => {
    setUser(null);
    localStorage.removeItem('braz_user');
    localStorage.removeItem('braz_expires_at');
  };

  const login = (data: any) => {
    // O backend envia { user: {...}, expiresAt } — SEM token no body (#1)
    const userData = data.user;

    const finalUser: User = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      displayName: userData.displayName,
      photoUrl: userData.photoUrl,
      tier: userData.tier,
      points: userData.points,
      clientId: userData.clientId,
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

    logoutLocal();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      updateUser,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'SUPER_ADMIN',
      isStaff: user?.role === 'ADMIN_STAFF' || user?.role === 'SUPER_ADMIN',
      isAccountant: user?.role === 'ACCOUNTANT' || user?.role === 'SUPER_ADMIN'
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
