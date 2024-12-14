// src/pages/CustomerService/components/Header.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Command } from 'lucide-react';

/**
 * SearchBox - 搜索框子组件
 */
const SearchBox = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative max-w-2xl mx-auto"
    >
      <div className={`relative group rounded-2xl transition-all duration-300
        ${isFocused ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20' : 'hover:ring-2 hover:ring-gray-700'}`}
      >
        {/* 搜索框背景 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl" />
        
        {/* 搜索框输入区域 */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索问题..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-14 pl-12 pr-32 bg-transparent text-gray-200 placeholder-gray-500 
              focus:outline-none text-base rounded-2xl"
          />
          
          {/* 快捷键提示 */}
          <div className="absolute right-4 flex items-center gap-2">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 
                  hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/80 
              border border-gray-700/50">
              <Command className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索框光晕效果 */}
      <motion.div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 
          opacity-0 blur-xl transition-opacity duration-300"
        animate={{ opacity: isFocused ? 1 : 0 }}
      />
    </motion.div>
  );
};

/**
 * Header - 页头主组件
 */
const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="mb-12">
      {/* 背景容器 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f16] via-[#111827] to-[#1a1f2c]">
          {/* 网格背景 */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          {/* 光晕效果 */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-0 right-0 w-[500px] h-[500px] 
              bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1] 
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] 
              bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl"
          />
        </div>

        {/* 主要内容 */}
        <div className="relative px-8 py-16">
          <div className="max-w-2xl mx-auto text-center mb-10 space-y-6">
            {/* 标题区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                有什么可以帮您？
              </h1>
            </motion.div>

            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg font-medium"
            >
              搜索您需要的帮助，或浏览下方的常见问题
            </motion.p>
          </div>

          {/* 搜索框 */}
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </motion.div>
    </div>
  );
};

export default Header;