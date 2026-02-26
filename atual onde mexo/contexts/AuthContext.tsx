  import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definimos o tipo de utilizador (Admin ou Cliente)
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
}

// 2. Definimos o que o nosso contexto vai partilhar
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// 3. Criamos o contexto propriamente dito
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Componente Provider: Vai "envolver" a nossa app e fornecer os dados
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // O estado inicial procura no localStorage para ver se o utilizador já tinha feito login antes
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('braz_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('braz_user', JSON.stringify(userData)); // Guarda a sessão
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('braz_user'); // Limpa a sessão
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Um "Hook" personalizado para ser fácil aceder a estes dados noutros ficheiros
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};