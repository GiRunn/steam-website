import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorScreen = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-4"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4">
          加载失败
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          抱歉，加载游戏信息时出现错误。请检查您的网络连接，然后重试。
        </p>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 
              to-purple-600 text-white font-medium flex items-center gap-2
              hover:from-blue-500 hover:to-purple-500 transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
            重试
          </motion.button>

          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium
                flex items-center gap-2 hover:bg-white/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              返回首页
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorScreen;