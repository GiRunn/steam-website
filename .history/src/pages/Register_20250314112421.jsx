import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名为必填项';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱为必填项';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    if (!formData.password) {
      newErrors.password = '密码为必填项';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (!agreeToTerms) {
      newErrors.terms = '请阅读并同意服务条款';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: 实现注册逻辑
      console.log('Registration attempt:', formData);
      navigate('/login');
    }
  };

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative">
      <input
        {...props}
        className="w-full px-4 py-3 bg-[#2a475e]/50 border border-gray-600 
          placeholder-gray-400 text-white rounded-lg focus:outline-none 
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <Icon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
      {errors[props.name] && (
        <p className="mt-1 text-sm text-red-400">{errors[props.name]}</p>
      )}
    </div>
  );

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
            创建新账户
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            或{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              登录现有账户
            </Link>
          </p>
        </div>

        {/* 注册表单 */}
        <motion.form 
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            {/* 用户名输入 */}
            <div>
              <label className="text-sm font-medium text-gray-300" htmlFor="username">
                用户名
              </label>
              <InputField
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="输入用户名"
                value={formData.username}
                onChange={handleChange}
                icon={User}
              />
            </div>

            {/* 邮箱输入 */}
            <div>
              <label className="text-sm font-medium text-gray-300" htmlFor="email">
                邮箱地址
              </label>
              <InputField
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label className="text-sm font-medium text-gray-300" htmlFor="password">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2a475e]/50 border border-gray-600 
                    placeholder-gray-400 text-white rounded-lg focus:outline-none 
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="设置密码"
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
            </div>

            {/* 确认密码 */}
            <div>
              <label className="text-sm font-medium text-gray-300" htmlFor="confirmPassword">
                确认密码
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2a475e]/50 border border-gray-600 
                    placeholder-gray-400 text-white rounded-lg focus:outline-none 
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="再次输入密码"
                />
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* 密码强度指示器 */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      formData.password.length >= level * 2
                        ? level <= 2 
                          ? 'bg-red-500'
                          : level === 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                密码至少包含 6 个字符
              </p>
            </div>
          </div>

          {/* 服务条款 */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-500 bg-[#2a475e]/50 border-gray-600 
                  rounded focus:ring-blue-500"
              />
            </div>
            <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
              我已阅读并同意 
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                服务条款
              </Link>
              {' '}和{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                隐私政策
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-400">{errors.terms}</p>
          )}

          {/* 注册按钮 */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center px-4 py-3 
              bg-gradient-to-r from-blue-500 to-purple-500
              hover:from-blue-600 hover:to-purple-600
              text-white rounded-lg font-medium shadow-lg shadow-blue-500/25"
          >
            <span>创建账户</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default Register;