import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  // 使用状态来存储认证状态，确保组件重新渲染时能够获取最新的认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 检查认证状态
    const checkAuth = () => {
      // 清除控制台
      console.clear();
      console.log('=== ProtectedRoute 认证检查 ===');
      console.log('当前路径:', location.pathname);
      
      // 检查localStorage中的认证状态
      const isAuthInStorage = localStorage.getItem('isAuthenticated') === 'true';
      console.log('localStorage中的认证状态:', isAuthInStorage);
      
      // 检查用户数据
      const userInStorage = localStorage.getItem('user');
      console.log('localStorage中的用户数据:', userInStorage);
      
      // 使用authService检查认证状态
      const authStatus = authService.isAuthenticated();
      logger.debug(`Protected Route - 路径: ${location.pathname}`);
      logger.debug(`Protected Route - 认证状态: ${authStatus}`);
      console.log('authService.isAuthenticated()结果:', authStatus);
      
      const user = authService.getCurrentUser();
      logger.debug(`Protected Route - 当前用户: ${user ? JSON.stringify(user) : '未登录'}`);
      console.log('当前用户:', user);
      
      setIsAuthenticated(authStatus);
      setIsChecking(false);
      
      console.log('最终认证状态:', authStatus);
      console.log('=== 认证检查结束 ===');
    };
    
    checkAuth();
  }, [location.pathname]);

  // 如果正在检查认证状态，显示空内容
  if (isChecking) {
    return <div>正在检查认证状态...</div>;
  }

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    logger.info(`Protected Route - 未认证用户尝试访问: ${location.pathname}`);
    console.log(`未认证用户尝试访问: ${location.pathname}，重定向到登录页面`);
    // 将用户重定向到登录页面，同时保存他们试图访问的URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  logger.debug(`Protected Route - 允许访问: ${location.pathname}`);
  console.log(`允许访问: ${location.pathname}`);
  return children;
};

export default ProtectedRoute; 