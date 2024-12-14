// src/pages/CustomerService/components/Header.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Command, HelpCircle, Book, MessagesSquare } from 'lucide-react';

/**
 * QuickLinks - 快捷链接子组件
 */
const QuickLinks = () => {
  const links = [
    { icon: HelpCircle, text: '常见问题', color: 'text-blue-400' },
    { icon: Book, text: '使用指南', color: 'text-purple-400' },
    { icon: MessagesSquare, text: '联系客服', color: 'text-green-400' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-center justify-center gap-6 mt-6"
    >
      {links.map(({ icon: Icon, text, color }, index) => (
        <motion.button
          key={text}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30
            transition-colors duration-200`}
        >
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm text-gray-300">{text}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

/**
 * SearchBox - 增强版搜索框子组件
 */
const SearchBox = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  }, [searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative z-20">
        {/* 搜索框容器 */}
        <div
          className={`relative rounded-2xl transition-all duration-300
            ${isFocused ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10' : 'hover:ring-2 hover:ring-gray-700/50'}`}
        >
          {/* 玻璃态背景 - 修改z-index确保在输入框下方 */}
          <div className="absolute inset-0 rounded-2xl bg-gray-900/50 backdrop-blur-xl z-0" />
          
          {/* 输入区域 - 包装器添加相对定位和z-index */}
          <div className="relative z-10">
            {/* 搜索图标 */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-400 pointer-events-none">
              <Search className="w-5 h-5" />
              {!isFocused && !searchTerm && (
                <div className="h-5 w-px bg-gray-700" />
              )}
            </div>

            {/* 输入框 - 确保最高层级 */}
            <input
              type="text"
              placeholder="搜索问题或关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="relative w-full h-14 pl-14 pr-36 bg-transparent text-gray-200 
                placeholder-gray-500 focus:outline-none text-base rounded-2xl
                focus:placeholder-gray-400 transition-colors"
            />

            {/* 右侧按钮组 - 确保正确的层级 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 
                      hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* 搜索按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 
                  text-blue-400 rounded-lg border border-blue-500/30
                  transition-colors duration-200 text-sm font-medium"
              >
                搜索
              </motion.button>

              {/* 快捷键提示 */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg 
                bg-gray-800/80 border border-gray-700/50">
                <Command className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索框光晕效果 - 确保在最底层 */}
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 
            opacity-0 blur-xl transition-opacity duration-300 z-0"
          animate={{ opacity: isFocused ? 1 : 0 }}
        />
      </form>

      {/* 底部装饰效果 - 确保在最底层 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl" />
      </div>
    </motion.div>
  );
};


/**
 * Header - 增强版页头主组件
 */
const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="mb-12">
      {/* 背景容器 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-[#0a0f16]"
      >
        {/* 动态背景效果 */}
        <div className="absolute inset-0">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f16] via-[#111827] to-[#1a1f2c]" />
          
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          {/* 动态光晕 */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1] 
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-0 right-0 w-[600px] h-[600px] 
              bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-20 -left-20 w-[600px] h-[600px] 
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
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 0.9, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-8 h-8 text-blue-400" />
              </motion.div>
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
              className="text-lg text-gray-400 font-medium"
            >
              搜索您需要的帮助，或浏览下方的常见问题
            </motion.p>
          </div>

          {/* 搜索框 */}
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* 快捷链接 */}
          <QuickLinks />
        </div>
      </motion.div>
    </div>
  );
};

export default Header;