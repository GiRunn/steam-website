import React, { memo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-12 h-12 bg-blue-500/30 rounded-full mb-3"></div>
      <div className="h-3 w-24 bg-gray-600 rounded mb-2"></div>
      <div className="h-2 w-16 bg-gray-700 rounded"></div>
    </div>
  </div>
);

const MainContent = ({ 
  isDarkMode, 
  isCollapsed, 
  setIsCollapsed, 
  activeTab, 
  tabs, 
  renderContent 
}) => {
  // 内容区域动画配置
  const contentAnimation = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      mass: 0.8
    }
  };

  // 容器动画配置
  const containerAnimation = {
    initial: { width: "100%" },
    animate: { 
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      layout
      className="flex-1"
      {...containerAnimation}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div 
        className={`${isDarkMode ? 'bg-[#2a475e]/50' : 'bg-white'} rounded-lg p-4 sm:p-6 shadow-lg ${isDarkMode ? 'shadow-blue-900/5' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <motion.h2 
            className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} tracking-wide`}
            layout
          >
            {tabs.find(tab => tab.id === activeTab)?.label}
          </motion.h2>
          {isCollapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCollapsed(false)}
              className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-[#1b2838]/50' : 'text-gray-600 hover:bg-gray-200'}`}
              aria-label="展开侧边栏"
            >
              <motion.div
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            </motion.button>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...contentAnimation}
          >
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// 使用 memo 优化组件，避免不必要的重新渲染
export default memo(MainContent); 