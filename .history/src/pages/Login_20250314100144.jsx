import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Bug } from 'lucide-react';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    logger.debug(`Login - 页面状态: ${JSON.stringify(location.state)}`);
    const isAuth = authService.isAuthenticated();
    logger.debug(`Login - 初始认证状态: ${isAuth}`);
    
    if (isAuth) {
      const from = location.state?.from || '/user-center';
      logger.info(`Login - 已认证用户重定向至: ${from}`);
      navigate(from, { replace: true });
    }
  }, [navigate, location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    logger.info(`Login - 登录尝试 - 邮箱: ${email}`);

    try {
      const result = await authService.login(email, password);
      logger.debug(`Login - 登录结果: ${JSON.stringify(result)}`);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          logger.debug('Login - 已设置记住登录状态');
        }
        const from = location.state?.from || '/user-center';
        logger.info(`Login - 登录成功，重定向至: ${from}`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      logger.error(`Login - 登录错误: ${err.message}`);
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugClick = () => {
    setShowDebug(!showDebug);
  };

  const handleExportLogs = () => {
    logger.exportLogs();
  };

  return (
    <div className="min-h-screen bg-[#1b2838] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link 
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
              bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 inline-block"
          >
            GAME STORE
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            登录您的账户
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            测试账号: admin@gamestore.com<br/>
            密码: admin
          </p>
          <p className="mt-2 text-sm text-gray-400">
            或{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              创建新账户
            </Link>
          </p>
        </div>

        {/* 登录表单 */}
        <motion.form 
          className="mt-8 space-y-6"
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <label className="text-sm font-medium text-gray-300" htmlFor="email">
                邮箱地址
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2a475e]/50 border border-gray-600 
                    placeholder-gray-400 text-white rounded-lg focus:outline-none 
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="text-sm font-medium text-gray-300" htmlFor="password">
                密码
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2a475e]/50 border border-gray-600 
                    placeholder-gray-400 text-white rounded-lg focus:outline-none 
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                    <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* 记住我和忘记密码 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-500 bg-[#2a475e]/50 border-gray-600 
                  rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                记住我
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
                忘记密码?
              </Link>
            </div>
          </div>

          {/* 登录按钮 */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className={`w-full flex items-center justify-center px-4 py-3 
              bg-gradient-to-r from-blue-500 to-purple-500
              hover:from-blue-600 hover:to-purple-600
              text-white rounded-lg font-medium shadow-lg shadow-blue-500/25
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span>{isLoading ? '登录中...' : '登录'}</span>
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </motion.button>

          {/* Debug Panel */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDebugClick}
              className="flex items-center text-sm text-gray-400 hover:text-gray-300"
            >
              <Bug className="h-4 w-4 mr-1" />
              {showDebug ? '隐藏调试信息' : '显示调试信息'}
            </button>

            {showDebug && (
              <div className="mt-2 p-4 bg-[#2a475e]/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">最近的日志</span>
                  <button
                    type="button"
                    onClick={handleExportLogs}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    导出日志
                  </button>
                </div>
                <div className="text-xs text-gray-400 space-y-1 max-h-40 overflow-auto">
                  {logger.getRecentLogs().map((log, index) => (
                    <div key={index} className={`
                      ${log.type === 'ERROR' ? 'text-red-400' : ''}
                      ${log.type === 'DEBUG' ? 'text-gray-400' : ''}
                      ${log.type === 'INFO' ? 'text-blue-400' : ''}
                    `}>
                      {log.formattedMessage}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400">
                  <p>认证状态: {authService.isAuthenticated() ? '已登录' : '未登录'}</p>
                  <p>当前用户: {JSON.stringify(authService.getCurrentUser())}</p>
                </div>
              </div>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;