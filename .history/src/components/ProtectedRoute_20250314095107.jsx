import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // 在组件挂载时检查认证状态
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // 将用户重定向到登录页面，同时保存他们试图访问的URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute; 