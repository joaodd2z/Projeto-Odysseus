import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../stores/useAppStore';
import LoadingScreen from './LoadingScreen';

const PublicRoute = ({ children, redirectIfAuthenticated = true, redirectTo = '/dashboard' }) => {
  const { user, loading: authLoading } = useAuth();
  const { isLoading } = useAppStore();
  const location = useLocation();
  
  // Show loading screen while authentication is being checked
  if (authLoading || isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  
  // If user is authenticated and this route should redirect authenticated users
  if (user && redirectIfAuthenticated) {
    // Get the return path from location state or use default
    const returnTo = location.state?.returnTo || redirectTo;
    return <Navigate to={returnTo} replace />;
  }
  
  // Render the public component
  return children;
};

export default PublicRoute;