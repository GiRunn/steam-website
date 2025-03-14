import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import { authService } from '../../services/authService';
import { logger } from '../../utils/logger';
import Footer from '../../components/Footer';
import Navbar from './components/Navbar';

// 使用懒加载导入组件
const Profile = lazy(() => import('./components/Profile'));
const Security = lazy(() => import('./components/Security'));
const Orders = lazy(() => import('./components/Orders'));
const Balance = lazy(() => import('./components/Balance'));
const Wishlist = lazy(() => import('./components/Wishlist'));
const Posts = lazy(() => import('./components/Posts'));
const Comments = lazy(() => import('./components/Comments'));
const Collections = lazy(() => import('./components/Collections'));
const Social = lazy(() => import('./components/Social'));

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

const UserCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '账户安全提醒', message: '您的账户已超过30天未修改密码', date: '2024-03-14', read: false },
    { id: 2, title: '愿望单商品降价', message: '您关注的《赛博朋克2077》已降价50%', date: '2024-03-10', read: true },
    { id: 3, title: '订单发货通知', message: '您的订单 #ORD-2024-0001 已发货', date: '2024-03-08', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // 监听滚动事件，控制返回顶部按钮显示
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 使用 useCallback 优化函数
  const handleLogout = useCallback(() => {
    authService.logout();
    navigate('/login');
  }, [navigate]);

  const handleUpdateProfile = useCallback((updatedInfo) => {
    setUserInfo(prevInfo => ({
      ...prevInfo,
      ...updatedInfo
    }));
    // 在实际应用中，这里应该调用API更新用户信息
  }, []);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    setShowNotifications(false);
  }, []);

  // 使用 useMemo 优化计算属性
  const unreadNotificationsCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // 使用 useMemo 优化 tabs 数组
  const tabs = useMemo(() => [
    { id: 'profile', label: '个人信息', icon: User },
    { id: 'orders', label: '订单列表', icon: ShoppingBag },
    { id: 'balance', label: '可用余额', icon: Wallet },
    { id: 'wishlist', label: '关注商品', icon: Heart },
    { id: 'security', label: '账户安全', icon: Shield },
    { id: 'posts', label: '我的发帖', icon: Edit3 },
    { id: 'comments', label: '我的评论', icon: MessageSquare },
    { id: 'collections', label: '我的收藏', icon: Bookmark },
    { id: 'social', label: '粉丝与关注', icon: Users }
  ], []);

  // 优化 useEffect，减少不必要的重新渲染
  useEffect(() => {
    // 加载用户信息
    const loadUserInfo = async () => {
      setIsLoading(true);
      logger.debug('UserCenter - 加载用户信息');
      try {
        const user = authService.getCurrentUser();
        
        if (user) {
          logger.info(`UserCenter - 用户信息加载成功: ${user.username}`);
          setUserInfo(user);
        } else {
          logger.error('UserCenter - 无法获取用户信息，重定向到登录页');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        logger.error(`UserCenter - 加载用户信息失败: ${error.message}`);
        navigate('/login', { replace: true });
      } finally {
        // 添加小延迟以避免闪烁
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };
    
    loadUserInfo();
  }, [navigate]);

  // 使用 useCallback 优化 renderContent 函数
  const renderContent = useCallback(() => {
    if (!userInfo) return null;

    switch (activeTab) {
      case 'profile':
        return <Profile userInfo={userInfo} onUpdateProfile={handleUpdateProfile} />;
      case 'orders':
        return <Orders />;
      case 'balance':
        return <Balance userInfo={userInfo} />;
      case 'wishlist':
        return <Wishlist />;
      case 'security':
        return <Security />;
      case 'posts':
        return <Posts />;
      case 'comments':
        return <Comments />;
      case 'collections':
        return <Collections />;
      case 'social':
        return <Social userInfo={userInfo} />;
      default:
        return (
          <div className="text-center text-gray-400">
            该功能正在开发中...
          </div>
        );
    }
  }, [activeTab, userInfo, handleUpdateProfile]);

  // 优化加载状态显示
  if (isLoading) return (
    <div className="min-h-screen bg-[#1b2838] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-500/30 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-600 rounded mb-3"></div>
        <div className="h-3 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  // 优化动画配置，提高流畅度
  const animationConfig = {
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

  // 侧边栏动画配置
  const sidebarAnimationConfig = {
    initial: { width: 0, opacity: 0 },
    animate: { width: 'auto', opacity: 1 },
    exit: { width: 0, opacity: 0 },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      mass: 0.8
    }
  };

  // 按钮悬停动画
  const buttonHoverAnimation = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1b2838]' : 'bg-gray-100'} transition-colors duration-300 text-sm sm:text-base font-['Poppins',system-ui,sans-serif]`}>
      {/* 使用独立的Navbar组件 */}
      <Navbar 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        handleMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        handleClearNotifications={handleClearNotifications}
        userInfo={userInfo}
      />

      <LayoutGroup>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex">
            {/* 侧边栏 */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  {...sidebarAnimationConfig}
                  className="w-56 sm:w-64 flex-shrink-0 mr-4 sm:mr-6"
                >
                  <div className={`sticky top-20 sm:top-24 ${isDarkMode ? 'bg-[#2a475e]/50' : 'bg-white'} rounded-lg p-3 sm:p-4 space-y-1 sm:space-y-2 ${isDarkMode ? 'shadow-blue-900/5' : 'shadow-lg'} shadow-lg`}>
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                            transition-all duration-300 text-sm sm:text-base ${
                            activeTab === tab.id
                                ? isDarkMode 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                  : 'bg-blue-500 text-white shadow-md'
                                : isDarkMode
                                  ? 'text-gray-300 hover:bg-[#1b2838]/70'
                                  : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>{tab.label}</span>
                          {activeTab === tab.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                    
                    {/* 分隔线 */}
                    <div className={`my-1 sm:my-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    
                    {/* 额外选项 */}
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                        transition-colors duration-300 text-sm sm:text-base ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-[#1b2838]/70'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>设置</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                        transition-colors duration-300 text-sm sm:text-base ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-[#1b2838]/70'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>帮助中心</span>
                    </motion.button>
                    
                    {/* 登出按钮 */}
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                        transition-colors duration-300 text-sm sm:text-base ${
                          isDarkMode
                            ? 'text-red-400 hover:bg-red-500/10'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                    >
                      <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>退出登录</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 主要内容区 */}
            <motion.div
              layout
              className="flex-1"
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
                      {...buttonHoverAnimation}
                      onClick={() => setIsCollapsed(false)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-[#1b2838]/50' : 'text-gray-600 hover:bg-gray-200'}`}
                      aria-label="展开侧边栏"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </motion.button>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    {...animationConfig}
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      {renderContent()}
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </LayoutGroup>
      
      {/* 使用Footer组件替换原有页脚 */}
      <Footer darkMode={isDarkMode} showScrollTop={showScrollTop} />
    </div>
  );
};

export default UserCenter; 