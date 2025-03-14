import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, Menu, X } from 'lucide-react';

const Navbar = ({ 
  isDarkMode, 
  toggleTheme, 
  theme,
  isCollapsed, 
  setIsCollapsed, 
  notifications, 
  showNotifications, 
  setShowNotifications,
  handleMarkAllNotificationsAsRead,
  handleClearNotifications,
  userInfo,
  notificationPanelRef,
  notificationButtonRef
}) => {
  // 计算未读通知数量
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // 按钮悬停动画
  const buttonHoverAnimation = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17,
      mass: 0.5
    }
  };

  // 通知面板动画
  const notificationPanelAnimation = {
    initial: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95
    },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30,
      mass: 0.8
    }
  };

  // 通知徽章动画
  const badgeAnimation = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    exit: { 
      scale: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // 通知项动画
  const notificationItemAnimation = {
    initial: { x: -20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      x: 20, 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    whileHover: { 
      x: 3,
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(243, 244, 246, 0.8)',
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20
      }
    }
  };

  return (
    <header className={`${theme.background.navbar} backdrop-blur-md border-b ${theme.border.primary} sticky top-0 z-10 gpu-accelerated`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <motion.button
              {...buttonHoverAnimation}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`mr-3 p-2 rounded-lg ${theme.icon.primary} ${theme.background.buttonHover}`}
              aria-label="切换侧边栏"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isCollapsed ? 'collapsed' : 'expanded'}
                  initial={{ opacity: 0, rotate: isCollapsed ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: isCollapsed ? 90 : -90 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                >
                  {isCollapsed ? (
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <motion.h1 
              className={`text-lg sm:text-xl font-bold ${theme.text.primary} tracking-wide`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            >
              用户中心
            </motion.h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <motion.button
                ref={notificationButtonRef}
                {...buttonHoverAnimation}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full ${theme.background.buttonHover} relative`}
                aria-label="通知"
              >
                <Bell className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.icon.primary}`} />
                <AnimatePresence>
                  {unreadNotificationsCount > 0 && (
                    <motion.span 
                      {...badgeAnimation}
                      className="absolute top-0 right-0 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadNotificationsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    ref={notificationPanelRef}
                    {...notificationPanelAnimation}
                    className={`absolute right-0 mt-2 w-72 sm:w-80 ${theme.background.secondary} ${theme.border.primary} border rounded-lg shadow-lg z-20 overflow-hidden`}
                  >
                    <div className={`p-3 border-b ${theme.border.primary} flex justify-between items-center`}>
                      <h3 className={`font-medium ${theme.text.primary}`}>通知</h3>
                      <div className="flex space-x-2">
                        <motion.button 
                          {...buttonHoverAnimation}
                          onClick={handleMarkAllNotificationsAsRead}
                          className={`text-xs ${theme.text.link}`}
                        >
                          全部已读
                        </motion.button>
                        <motion.button 
                          {...buttonHoverAnimation}
                          onClick={handleClearNotifications}
                          className={`text-xs ${theme.text.danger}`}
                        >
                          清空
                        </motion.button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <AnimatePresence>
                        {notifications.length > 0 ? (
                          <motion.div>
                            {notifications.map((notification, index) => (
                              <motion.div 
                                key={notification.id}
                                {...notificationItemAnimation}
                                transition={{
                                  delay: index * 0.05,
                                  ...notificationItemAnimation.transition
                                }}
                                className={`p-3 border-b ${theme.border.primary} cursor-pointer ${!notification.read ? theme.background.notification : ''}`}
                              >
                                <div className="flex justify-between">
                                  <h4 className={`font-medium text-sm ${theme.text.primary}`}>{notification.title}</h4>
                                  <span className={`text-xs ${theme.text.tertiary}`}>{notification.date}</span>
                                </div>
                                <p className={`text-xs sm:text-sm mt-1 ${theme.text.secondary}`}>{notification.message}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 text-center text-gray-500 text-sm"
                          >
                            暂无通知
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              {...buttonHoverAnimation}
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme.background.buttonHover}`}
              aria-label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 0 : 180 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                {isDarkMode ? (
                  <Sun className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.icon.primary}`} />
                ) : (
                  <Moon className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.icon.primary}`} />
                )}
              </motion.div>
            </motion.button>
            
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.img 
                src={userInfo.avatar} 
                alt="用户头像" 
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border-2 border-blue-500/30"
                loading="lazy"
                whileHover={{ 
                  borderColor: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)',
                  transition: { duration: 0.3 }
                }}
              />
              <motion.span 
                className={`ml-2 font-medium text-sm sm:text-base ${theme.text.primary}`}
              >
                {userInfo.username}
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

// 使用 memo 优化组件，避免不必要的重新渲染
export default memo(Navbar); 