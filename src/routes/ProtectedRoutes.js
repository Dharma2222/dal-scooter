import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects routes that require authentication.
 * Users must complete the full multi-factor flow (including Caesar cipher) to obtain a token.
 */
const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  // If authenticated, render nested routes; otherwise redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoutes;