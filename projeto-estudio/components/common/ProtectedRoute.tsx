import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client'; // Opcional: define se a rota exige ser admin ou apenas cliente
}

/**
 * Componente que protege rotas.
 * Se o utilizador não estiver autenticado, é recambiado para a página inicial.
 * Se a rota exigir ser 'admin' e o utilizador for apenas 'client', também é bloqueado.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  // 1. Verifica se está logado
  if (!isAuthenticated || !user) {
    return <Navigate to="/vip" replace />; // Mandamos para a página de login VIP
  }

  // 2. Verifica se tem a permissão correta (ex: tentar aceder ao admin com conta de cliente)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />; // Se não tiver permissão, vai para a Home
  }

  // Se passar nas verificações, mostra o conteúdo da página protegida
  return <>{children}</>;
};

export default ProtectedRoute;