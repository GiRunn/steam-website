// src/pages/CustomerService/components/Header.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  X, 
  Command, 
  HelpCircle, 
  Book, 
  MessagesSquare, 
  ChevronRight,
  LifeBuoy,
  FileText,
  MessageCircle,
  ArrowDown
} from 'lucide-react';


/**
 * QuickLinks - 快捷链接子组件
 */
const QuickLinks = ({ scrollProgress }) => {
  const opacity = useTransform(scrollProgress, [0, 0.3], [1, 0]);
  const y = useTransform(scrollProgress, [0, 0.3], [0, 30]);
  
  const links = [
    { 
      icon: LifeBuoy, 
      text: '在线客服', 
      description: '实时解答您的问题',
      gradient: 'from-blue-500/20 to-blue-600/20'
    },
    { 
      icon: FileText, 
      text: '帮助文档', 
      description: '查看常见问题解答',
      gradient: 'from-purple-500/20 to-purple-600/20'
    },
    { 
      icon: MessageCircle, 
      text: '社区交流', 
      description: '与其他用户讨论',
      gradient: 'from-indigo-500/20 to-indigo-600/20'
    }
  ];

  return (
    <motion.div 
      style={{ opacity, y }}
      className="flex items-center justify-center gap-6 mt-12"
    >
      {links.map((link, index) => (
        <motion.button
          key={link.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 1.5 + index * 0.1,
            ease: "easeOut"
          }}
          className={`
            relative group flex flex-col items-center p-6 
            rounded-2xl backdrop-blur-sm
            hover:bg-gray-800/30 transition-all duration-300
            border border-gray-800/50 
            hover:border-gray-700/50 hover:shadow-lg
          `}
        >
          {/* 背景渐变 */}
          <div className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
            transition-opacity duration-300 bg-gradient-to-br ${link.gradient}
          `} />

          {/* 内容 */}
          <div className="relative z-10">
            <link.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-400 
              transition-colors duration-300 mb-3" />
            <div className="text-base font-medium text-gray-200 group-hover:text-white
              transition-colors duration-300">
              {link.text}
            </div>
            <div className="text-sm text-gray-500 group-hover:text-gray-400
              transition-colors duration-300 mt-1">
              {link.description}
            </div>
          </div>

          {/* 悬浮特效 */}
          <motion.div
            initial={false}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100
              bg-gradient-to-br from-white/5 to-white/0"
          />
        </motion.button>
      ))}
    </motion.div>
  );
};

/**
 * InitialOverlay - 初始全屏遮罩动画
 */
const InitialOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 1 }}
      onAnimationComplete={() => {
        document.body.style.overflow = '';  // 动画完成后启用滚动
      }}
      className="fixed inset-0 bg-[#0a0f16] z-50 pointer-events-none"
    />
  );
};

/**
 * ScrollIndicator - 滚动提示组件
 */
const ScrollIndicator = ({ scrollProgress }) => {
  const opacity = useTransform(scrollProgress, [0, 0.1], [1, 0]);
  const y = useTransform(scrollProgress, [0, 0.1], [0, 20]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </motion.div>
      <span className="text-sm text-gray-400">向下滚动探索更多</span>
    </motion.div>
  );
};

/**
 * BackgroundAnimation - 增强的背景动画组件
 */
const BackgroundAnimation = ({ scrollProgress }) => {
  const bgOpacity = useTransform(scrollProgress, [0, 0.5], [1, 0.6]);
  const bgScale = useTransform(scrollProgress, [0, 0.5], [1, 1.1]);
  const blurStrength = useTransform(scrollProgress, [0, 0.5], [0, 5]);

  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden"
      style={{ 
        opacity: bgOpacity,
        scale: bgScale
      }}
    >
      {/* 基础渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f16] via-[#111827] to-[#1a1f2c]" />
      
      {/* 动态网格 */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
          filter: useTransform(scrollProgress, [0, 1], ['blur(0px)', 'blur(3px)'])
        }}
      />
      
      {/* 动态光效 */}
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
        className="absolute top-0 right-0 w-[800px] h-[800px] 
          bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl"
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
        className="absolute -bottom-20 -left-20 w-[800px] h-[800px] 
          bg-gradient-to-tr from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl"
      />

      {/* 星光效果 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut"
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />
    </motion.div>
  );
};

/**
 * Title - 标题组件
 */
const Title = ({ scrollProgress }) => {
  const titleScale = useTransform(scrollProgress, [0, 0.3], [1, 0.8]);
  const titleOpacity = useTransform(scrollProgress, [0, 0.3], [1, 0.9]);
  const titleY = useTransform(scrollProgress, [0, 0.3], [0, -20]);

  return (
    <motion.div
      style={{ scale: titleScale, opacity: titleOpacity, y: titleY }}
      className="flex flex-col items-center justify-center gap-6 mb-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
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
          <Sparkles className="w-12 h-12 text-blue-400" />
        </motion.div>
        <h1 className="text-5xl font-bold bg-clip-text text-transparent 
          bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400
          tracking-tight"
        >
          有什么可以帮您？
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="text-xl text-gray-400 font-medium max-w-2xl text-center"
      >
        我们随时准备为您解答问题，提供专业的支持服务
      </motion.p>
    </motion.div>
  );
};

// SearchSuggestions 组件保持不变...

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
const SearchBox = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // 延迟隐藏建议，以便用户可以点击
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
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
 * SearchBox - 优化的搜索框组件
 */
const SearchBox = ({ searchTerm, setSearchTerm, scrollProgress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchBoxScale = useTransform(scrollProgress, [0, 0.3], [1, 0.9]);
  const searchBoxOpacity = useTransform(scrollProgress, [0, 0.3], [1, 0.95]);
  const searchBoxY = useTransform(scrollProgress, [0, 0.3], [0, -10]);

  // ... 其他原有代码保持不变 ...

  return (
    <motion.div
      style={{ scale: searchBoxScale, opacity: searchBoxOpacity, y: searchBoxY }}
      className="relative max-w-2xl mx-auto z-20"
    >
      {/* ... 原有搜索框内容保持不变 ... */}
    </motion.div>
  );
};

/**
 * Header - 主组件
 */
const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const headerRef = useRef(null);
  const { scrollY } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化时确保是全屏
  useEffect(() => {
    // 强制设置初始视口高度
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    // 初始化时滚动到顶部
    window.scrollTo(0, 0);
    // 锁定滚动直到加载完成
    document.body.style.overflow = 'hidden';
    
    // 等待入场动画完成
    setTimeout(() => {
      setIsLoaded(true);
      document.body.style.overflow = '';
    }, 1000);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);

  // 滚动进度计算
  const scrollProgress = useTransform(
    scrollY,
    [0, window.innerHeight * 0.5], // 缩短滚动距离，使动画更快响应
    [0, 1]
  );

  // 动画值计算
  const containerHeight = useTransform(
    scrollProgress,
    [0, 1],
    ['100vh', '400px']
  );

  const contentScale = useTransform(
    scrollProgress,
    [0, 1],
    [1, 0.9]
  );

  const contentY = useTransform(
    scrollProgress,
    [0, 1],
    [0, 40]
  );

  const contentOpacity = useTransform(
    scrollProgress,
    [0, 0.8],
    [1, 0.9]
  );

  return (
    <>
      <InitialOverlay />
      
      {/* 固定位置的背景层 */}
      <div className="fixed inset-0 bg-[#0a0f16] -z-10" />

      {/* 主容器 */}
      <motion.div
        ref={headerRef}
        className="fixed inset-0 w-full overflow-hidden"
        style={{
          height: containerHeight,
          position: isLoaded ? 'relative' : 'fixed'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* 内容容器 */}
        <motion.div 
          className="relative h-full w-full rounded-3xl bg-[#0a0f16] overflow-hidden"
          style={{
            scale: contentScale,
            y: contentY,
            opacity: contentOpacity
          }}
        >
          {/* 背景动画 */}
          <BackgroundAnimation scrollProgress={scrollProgress} />

          {/* 主要内容 */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
            <Title scrollProgress={scrollProgress} />
            <SearchBox 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              scrollProgress={scrollProgress}
            />
            <QuickLinks scrollProgress={scrollProgress} />
            {/* 只在全屏状态显示滚动提示 */}
            <motion.div style={{ opacity: useTransform(scrollProgress, [0, 0.2], [1, 0]) }}>
              <ScrollIndicator scrollProgress={scrollProgress} />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* 占位元素，确保页面有足够的滚动空间 */}
      <div style={{ height: '200vh' }} />
    </>
  );
};

export default Header;