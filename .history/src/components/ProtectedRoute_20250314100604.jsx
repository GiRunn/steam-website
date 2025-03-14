import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    logger.debug(`Protected Route - 路径: ${location.pathname}`);
    logger.debug(`Protected Route - 认证状态: ${isAuthenticated}`);
    const user = authService.getCurrentUser();
    logger.debug(`Protected Route - 当前用户: ${user ? user.username : '未登录'}`);
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) {
    logger.info(`Protected Route - 未认证用户尝试访问: ${location.pathname}`);
    // 将用户重定向到登录页面，同时保存他们试图访问的URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  logger.debug(`Protected Route - 允许访问: ${location.pathname}`);
  return children;
};

export default ProtectedRoute; 