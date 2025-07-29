import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restricts routes when the user is already authenticated.
 * If authenticated, redirects to dashboard based on user role.
 */
const PublicRoutes = () => {
  const { isAuthenticated, authUser } = useAuth();

  // If not authenticated, render nested routes
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // If authenticated, redirect based on user role
  if (authUser?.role === 'Client') {
    return <Navigate to="/user" replace />;
  } else if (authUser?.role === 'Partner' || authUser?.role === 'Franchise') {
    return <Navigate to="/partner" replace />;
  } else {
    // If role is not determined yet or unknown, redirect to login
    return <Navigate to="/auth/LoginPage" replace />;
  }
};

export default PublicRoutes;