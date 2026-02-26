import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hydrationStatus: 'pending' | 'hydrated';
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hydrationStatus, setHydrationStatus] = useState<'pending' | 'hydrated'>('pending');

  const executeHydration = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/auth');
      if (response.ok) {
        const { user: verifiedUser } = await response.json();
        setUser(verifiedUser);
      }
    } catch {
      // Loop de Vácuo: Ignora falhas de rede e assume estado unauthenticated
    } finally {
      setHydrationStatus('hydrated');
    }
  }, []);

  useEffect(() => {
    executeHydration();
  }, [executeHydration]);

  const login = async (email: string) => {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) throw new Error('AUTHORITY_DENIED');
    
    const { user: verifiedUser } = await response.json();
    setUser(verifiedUser);
  };

  const logout = async () => {
    setUser(null);
    await fetch('/.netlify/functions/auth', { method: 'DELETE' }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      hydrationStatus, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('FATAL: useAuth fora do escopo de AuthProvider');
  }
  return context;
};