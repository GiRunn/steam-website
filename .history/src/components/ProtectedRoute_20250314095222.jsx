import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    console.log('ProtectedRoute - Current location:', location.pathname);
    console.log('ProtectedRoute - Authentication status:', isAuthenticated);
    console.log('ProtectedRoute - Current user:', authService.getCurrentUser());
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login');
    // 将用户重定向到登录页面，同时保存他们试图访问的URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('ProtectedRoute - Rendering protected content');
  return children;
};

export default ProtectedRoute; 