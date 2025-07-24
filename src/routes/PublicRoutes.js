import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restricts routes when the user is already authenticated.
 * If authenticated, redirects to dashboard or home.
 */
const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();

  // If not authenticated, render nested routes; otherwise redirect to dashboard
  return !isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default PublicRoutes;