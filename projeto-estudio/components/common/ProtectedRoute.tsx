import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, hydrationStatus } = useAuth();

  if (hydrationStatus === 'pending') {
    // Suspensão visual enquanto o Edge valida o HttpOnly Cookie
    return <div className="min-h-screen bg-braz-black" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/vip" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;