import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // TODO: 调用忘记密码 API，发送重置密码邮件
        console.log('Forgot password attempt:', email);
        setEmailSent(true);
      } catch (error) {
        console.error('Error sending reset password email:', error);
        setErrors({ submit: '发送密码重置邮件时出错，请稍后重试。' });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = '请输入您的邮箱地址';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '邮箱格式不正确';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-[#1b2838] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
              bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 inline-block"
          >
            GAME STORE
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            忘记密码
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            我们将向您的邮箱发送一个重置密码的链接
          </p>
        </div>

        {emailSent ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-lg text-green-400">
              密码重置邮件已发送！请检查您的邮箱。
            </p>
            <p className="mt-2 text-sm text-gray-400">
              没有收到邮件？{' '}
              <button 
                onClick={handleSubmit}
                className="text-blue-400 hover:text-blue-300 focus:outline-none"
              >
                重新发送
              </button>
            </p>
            <p className="mt-4 text-sm text-gray-400">
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                返回登录
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
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
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center px-4 py-3
                bg-gradient-to-r from-blue-500 to-purple-500
                hover:from-blue-600 hover:to-purple-600 
                text-white rounded-lg font-medium shadow-lg shadow-blue-500/25"
            >
              <span>发送重置密码邮件</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>

            {errors.submit && (
              <p className="mt-4 text-sm text-red-400 text-center">{errors.submit}</p>
            )}

            <div className="text-sm text-gray-400 text-center">
              记起密码了？{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                返回登录
              </Link>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;