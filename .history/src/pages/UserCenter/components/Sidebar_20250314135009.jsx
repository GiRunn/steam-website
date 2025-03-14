import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronRight } from 'lucide-react';

const Sidebar = ({ 
  isCollapsed, 
  activeTab, 
  setActiveTab, 
  handleLogout,
  tabs,
  theme
}) => {
  // 侧边栏容器动画
  const sidebarContainerAnimation = {
    initial: { 
      width: isCollapsed ? 0 : 240,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40,
        duration: 0.3
      }
    },
    animate: { 
      width: isCollapsed ? 0 : 240,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40,
        duration: 0.3
      }
    },
    exit: { 
      width: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40,
        duration: 0.3
      }
    }
  };

  // 侧边栏内容动画
  const sidebarContentAnimation = {
    initial: { 
      opacity: 0,
      x: -20
    },
    animate: { 
      opacity: 1,
      x: 0,
      transition: { 
        delay: 0.1,
        type: "spring", 
        stiffness: 300, 
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      x: -20,
      transition: { 
        duration: 0.2
      }
    }
  };

  // 侧边栏项目动画
  const sidebarItemAnimation = {
    whileHover: { 
      x: 5,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 20
      }
    },
    whileTap: { 
      scale: 0.95
    }
  };

  // 侧边栏按钮动画
  const sidebarButtonAnimation = {
    whileHover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 17
      }
    },
    whileTap: { 
      scale: 0.95
    }
  };

  return (
    <motion.div
      className={`${theme.background.sidebar} ${theme.border.primary} border-r h-full overflow-hidden`}
      {...sidebarContainerAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div 
            className="h-full flex flex-col justify-between py-4"
            {...sidebarContentAnimation}
            key="sidebar-content"
          >
            <nav className="space-y-1 px-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                    activeTab === tab.id 
                      ? `${theme.background.activeTab} ${theme.text.active}` 
                      : `${theme.text.secondary} hover:${theme.background.hoverTab}`
                  }`}
                  {...sidebarItemAnimation}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">{tab.name}</span>
                  {activeTab === tab.id && (
                    <motion.div 
                      className="ml-auto"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </nav>
            
            <div className="px-2 mt-auto">
              <motion.button
                onClick={handleLogout}
                className={`w-full flex items-center px-3 py-2 rounded-lg ${theme.text.danger} hover:${theme.background.dangerHover} transition-colors duration-150`}
                {...sidebarButtonAnimation}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">退出登录</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 使用 memo 优化组件，避免不必要的重新渲染
export default memo(Sidebar); 