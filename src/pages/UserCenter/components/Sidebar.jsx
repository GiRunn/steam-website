import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Shield, 
  MessageSquare, 
  Bookmark, 
  Users, 
  Wallet,
  Edit3,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ 
  isDarkMode, 
  isCollapsed, 
  activeTab, 
  setActiveTab,
  handleLogout,
  tabs
}) => {
  // 侧边栏容器动画配置
  const sidebarContainerAnimation = {
    initial: { 
      width: 0,
      opacity: 0
    },
    animate: { 
      width: 'auto',
      opacity: 1,
      transition: {
        width: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
        opacity: { duration: 0.2 }
      }
    },
    exit: { 
      width: 0,
      opacity: 0,
      transition: {
        width: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
        opacity: { duration: 0.15 }
      }
    }
  };

  // 侧边栏内容动画配置
  const sidebarContentAnimation = {
    initial: { 
      opacity: 0,
      x: -10
    },
    animate: { 
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.05,
        duration: 0.2,
        staggerChildren: 0.03,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0,
      x: -5,
      transition: {
        duration: 0.1
      }
    }
  };

  // 侧边栏项目动画配置
  const sidebarItemAnimation = {
    initial: { 
      opacity: 0,
      x: -10
    },
    animate: { 
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      x: -5,
      transition: {
        duration: 0.1
      }
    }
  };

  // 按钮悬停动画
  const buttonHoverAnimation = {
    whileHover: { 
      x: 3,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    whileTap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  // 图标动画
  const iconAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  // 选中指示器动画
  const activeIndicatorAnimation = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isCollapsed && (
        <motion.div
          {...sidebarContainerAnimation}
          className="w-56 sm:w-64 flex-shrink-0 mr-4 sm:mr-6 overflow-hidden"
          layout
        >
          <motion.div 
            {...sidebarContentAnimation}
            className={`sticky top-20 sm:top-24 ${isDarkMode ? 'bg-[#2a475e]/50' : 'bg-white'} rounded-lg p-3 sm:p-4 space-y-1 sm:space-y-2 ${isDarkMode ? 'shadow-blue-900/5' : 'shadow-lg'} shadow-lg gpu-accelerated`}
          >
            {/* 主要选项卡 */}
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  {...buttonHoverAnimation}
                  {...sidebarItemAnimation}
                  transition={{
                    ...sidebarItemAnimation.transition,
                    delay: index * 0.03
                  }}
                  className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                    transition-colors duration-300 text-sm sm:text-base ${
                    activeTab === tab.id
                        ? isDarkMode 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                          : 'bg-blue-500 text-white shadow-md'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-[#1b2838]/70'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <motion.div {...iconAnimation}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  </motion.div>
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      {...activeIndicatorAnimation}
                      className="ml-auto"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
            
            {/* 分隔线 */}
            <motion.div 
              {...sidebarItemAnimation}
              className={`my-1 sm:my-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            ></motion.div>
            
            {/* 额外选项 */}
            <motion.button
              {...buttonHoverAnimation}
              {...sidebarItemAnimation}
              transition={{
                ...sidebarItemAnimation.transition,
                delay: tabs.length * 0.03 + 0.05
              }}
              className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                transition-colors duration-300 text-sm sm:text-base ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-[#1b2838]/70'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <motion.div {...iconAnimation}>
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.div>
              <span className="whitespace-nowrap">设置</span>
            </motion.button>
            
            <motion.button
              {...buttonHoverAnimation}
              {...sidebarItemAnimation}
              transition={{
                ...sidebarItemAnimation.transition,
                delay: tabs.length * 0.03 + 0.1
              }}
              className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                transition-colors duration-300 text-sm sm:text-base ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-[#1b2838]/70'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <motion.div {...iconAnimation}>
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.div>
              <span className="whitespace-nowrap">帮助中心</span>
            </motion.button>
            
            {/* 登出按钮 */}
            <motion.button
              onClick={handleLogout}
              {...buttonHoverAnimation}
              {...sidebarItemAnimation}
              transition={{
                ...sidebarItemAnimation.transition,
                delay: tabs.length * 0.03 + 0.15
              }}
              className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                transition-colors duration-300 text-sm sm:text-base ${
                  isDarkMode
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-red-500 hover:bg-red-50'
                }`}
            >
              <motion.div {...iconAnimation}>
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </motion.div>
              <span className="whitespace-nowrap">退出登录</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 使用 memo 优化组件，避免不必要的重新渲染
export default memo(Sidebar); 