import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatTestPage from '../pages/ChatTestPage';

/**
 * Restricts routes when the user is already authenticated.
 * If authenticated, redirects to dashboard or home.
 */
const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <Routes>
      <Route path="/chat-test" element={<ChatTestPage />} />
      <Route path="*" element={<Outlet />} />
    </Routes>
  );
};

export default PublicRoutes;