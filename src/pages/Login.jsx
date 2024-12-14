import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: 实现登录逻辑
    console.log('Login attempt:', { email, password, rememberMe });
    navigate('/store');
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
          <div className="text-sm text-gray-400 text-center mt-4">
              
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
                忘记密码?
              </Link>
            </div>            
          </div>

          {/* 登录按钮 */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center px-4 py-3 
              bg-gradient-to-r from-blue-500 to-purple-500
              hover:from-blue-600 hover:to-purple-600
              text-white rounded-lg font-medium shadow-lg shadow-blue-500/25"
          >
            <span>登录</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;