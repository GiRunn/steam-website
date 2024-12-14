// src/pages/CustomerService/components/Header.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, Command, HelpCircle, Book, MessagesSquare, ChevronRight } from 'lucide-react';

/**
 * SearchSuggestions - 搜索建议子组件
 */
const SearchSuggestions = ({ isVisible, searchTerm }) => {
  const suggestions = [
    { icon: HelpCircle, text: '如何修改账户密码？', category: '账户安全' },
    { icon: MessagesSquare, text: '游戏无法启动怎么办？', category: '常见问题' },
    { icon: Book, text: '如何申请退款？', category: '订单相关' }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-[#0a0f16]/95 
            backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-2xl 
            shadow-black/20 overflow-hidden z-50"
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800/50 
                  rounded-lg group transition-colors duration-200"
              >
                <suggestion.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 
                  transition-colors duration-200" />
                <div className="flex-grow text-left">
                  <div className="text-sm text-gray-200 group-hover:text-white 
                    transition-colors duration-200">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400
                    transition-colors duration-200">
                    {suggestion.category}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 
                  transition-colors duration-200" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * QuickLinks - 增强版快捷链接子组件
 */
const QuickLinks = () => {


  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex items-center justify-center gap-4 mt-8"
    >
      
    </motion.div>
  );
};

/**
 * SearchBox - 高级搜索框子组件
 */
const SearchBox = ({ searchTerm, setSearchTerm, onExpand }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
    onExpand?.(true);  // 使用可选链调用，防止 onExpand 未定义
  }, [onExpand]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => {
      setShowSuggestions(false);
      onExpand?.(false);  // 使用可选链调用，防止 onExpand 未定义
    }, 200);
  }, [onExpand]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    console.log('Searching for:', searchTerm);
  }, [searchTerm]);

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto z-20">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div
          className={`relative rounded-2xl transition-all duration-300
            ${isFocused ? 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10' : 
            'hover:ring-2 hover:ring-gray-700/50'}`}
        >
          {/* 搜索框背景 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r 
            from-gray-900/80 to-gray-800/80 backdrop-blur-xl" />
          
          {/* 输入区域 */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <Search className={`w-5 h-5 transition-colors duration-200
                ${isFocused ? 'text-blue-400' : 'text-gray-400'}`} />
              {!isFocused && !searchTerm && (
                <div className="h-5 w-px bg-gray-700" />
              )}
            </div>

            <input
              type="text"
              placeholder="搜索问题或关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full h-14 pl-14 pr-36 bg-transparent text-gray-200 
                placeholder-gray-500 focus:outline-none text-base rounded-2xl
                focus:placeholder-gray-400 transition-colors z-10"
            />

            {/* 右侧按钮组 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 
                      hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 
                  text-blue-400 rounded-lg border border-blue-500/30
                  transition-colors duration-200 text-sm font-medium
                  flex items-center gap-2"
              >
                <span>搜索</span>
                <div className="hidden sm:flex items-center gap-1 pl-2 border-l
                  border-blue-500/30">
                  <Command className="w-3 h-3" />
                  <span className="text-xs">K</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* 搜索建议 */}
        <SearchSuggestions isVisible={showSuggestions && isFocused} searchTerm={searchTerm} />
      </motion.form>
    </div>
  );
};

/**
 * BackgroundAnimation - 背景动画子组件
 */
const BackgroundAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
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
  );
};

/**
 * Header - 主组件
 */
const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div className="mb-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-[#0a0f16]"
      >
        <BackgroundAnimation />

        {/* 主要内容区域 - 使用motion.div实现平滑高度过渡 */}
        <motion.div 
          className="relative z-10 px-8"
          initial={{ paddingTop: "8rem", paddingBottom: "8rem" }}
          animate={{ 
            paddingTop: "4rem",
            paddingBottom: isSearchExpanded ? "8rem" : "4rem"
          }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1], // 使用缓动曲线让动画更自然
            paddingBottom: {
              type: "spring",
              stiffness: 100,
              damping: 15
            }
          }}
        >
          <div className="max-w-2xl mx-auto text-center mb-10 space-y-6">
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
                <Sparkles className="w-10 h-10 text-blue-400" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                有什么可以帮您？
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 font-medium"
            >
              搜索您需要的帮助，或浏览下方的常见问题
            </motion.p>
          </div>

          <SearchBox 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onExpand={setIsSearchExpanded}  // 传递展开状态的控制函数
          />
          <QuickLinks />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Header;