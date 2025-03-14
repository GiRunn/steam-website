import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Profile from './Profile';
import Comments from './Comments';
import Wishlist from './Wishlist';
import Orders from './Orders';
import Balance from './Balance';
import Social from './Social';
import Collections from './Collections';
import Posts from './Posts';
import Security from './Security';

const MainContent = ({ 
  activeTab, 
  isCollapsed, 
  userInfo, 
  theme 
}) => {
  // 主内容区域动画配置
  const contentAnimation = {
    initial: { 
      opacity: 0,
      y: 20
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2
      }
    }
  };

  // 加载动画配置
  const loadingAnimation = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // 根据激活的标签渲染对应的组件
  const renderActiveComponent = () => {
    // 模拟加载状态
    if (!userInfo) {
      return (
        <motion.div 
          {...loadingAnimation}
          className="flex flex-col items-center justify-center h-64"
        >
          <div className={`w-10 h-10 border-4 ${theme.border.loading} border-t-blue-500 rounded-full animate-spin`}></div>
          <p className={`mt-4 ${theme.text.secondary}`}>加载中...</p>
        </motion.div>
      );
    }

    // 根据激活的标签返回对应的组件
    switch (activeTab) {
      case 'profile':
        return <Profile userInfo={userInfo} theme={theme} />;
      case 'orders':
        return <Orders userInfo={userInfo} theme={theme} />;
      case 'wishlist':
        return <Wishlist userInfo={userInfo} theme={theme} />;
      case 'security':
        return <Security userInfo={userInfo} theme={theme} />;
      case 'comments':
        return <Comments userInfo={userInfo} theme={theme} />;
      case 'collections':
        return <Collections userInfo={userInfo} theme={theme} />;
      case 'social':
        return <Social userInfo={userInfo} theme={theme} />;
      case 'posts':
        return <Posts userInfo={userInfo} theme={theme} />;
      case 'balance':
        return <Balance userInfo={userInfo} theme={theme} />;
      default:
        return <Profile userInfo={userInfo} theme={theme} />;
    }
  };

  return (
    <motion.div 
      className={`flex-grow p-4 sm:p-6 ${theme.background.content} rounded-lg overflow-hidden`}
      animate={{ 
        marginLeft: isCollapsed ? 0 : 16,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 40,
          duration: 0.3
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          {...contentAnimation}
          className="h-full"
        >
          {renderActiveComponent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// 使用 memo 优化组件，避免不必要的重新渲染
export default memo(MainContent); 