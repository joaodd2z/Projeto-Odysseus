import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../stores/useAppStore';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/auth' }) => {
  const { user, loading: authLoading } = useAuth();
  const { isLoading } = useAppStore();
  const location = useLocation();
  
  // Show loading screen while authentication is being checked
  if (authLoading || isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // If route requires authentication but user is not logged in
  if (requireAuth && !user) {
    // Save the attempted location for redirecting after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname, returnTo: location.pathname + location.search }}
        replace 
      />
    );
  }
  
  // If route doesn't require authentication but user is logged in (e.g., auth page)
  if (!requireAuth && user) {
    // Get the return path from location state or default to dashboard
    const returnTo = location.state?.returnTo || '/dashboard';
    return <Navigate to={returnTo} replace />;
  }
  
  // Render the protected component
  return children;
};

export default ProtectedRoute;