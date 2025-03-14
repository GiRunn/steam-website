import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef } from 'react';
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
  Edit3
} from 'lucide-react';
import { authService } from '../../services/authService';
import { logger } from '../../utils/logger';
import Footer from '../../components/Footer';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

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
  
  // 创建通知面板的引用
  const notificationPanelRef = useRef(null);
  const notificationButtonRef = useRef(null);
  
  // 监听滚动事件，控制返回顶部按钮显示
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 监听点击事件，点击页面其他区域时关闭通知面板
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications && 
        notificationPanelRef.current && 
        notificationButtonRef.current && 
        !notificationPanelRef.current.contains(event.target) &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);
  
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

  // 共享的动画配置
  const sharedLayoutTransition = {
    type: "spring", 
    stiffness: 400, 
    damping: 35,
    mass: 0.8
  };

  return (
    <LayoutGroup id="user-center-layout">
      <motion.div 
        className={`min-h-screen ${isDarkMode ? 'bg-[#1b2838]' : 'bg-gray-100'} transition-colors duration-300 text-sm sm:text-base font-['Poppins',system-ui,sans-serif]`}
        initial={false}
        layout
        transition={sharedLayoutTransition}
      >
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
          notificationPanelRef={notificationPanelRef}
          notificationButtonRef={notificationButtonRef}
        />

        <motion.div 
          className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6"
          layout
          transition={sharedLayoutTransition}
        >
          <motion.div 
            className="flex items-start"
            layout
            transition={sharedLayoutTransition}
          >
            {/* 使用独立的Sidebar组件 */}
            <Sidebar 
              isDarkMode={isDarkMode}
              isCollapsed={isCollapsed}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleLogout={handleLogout}
              tabs={tabs}
            />

            {/* 使用独立的MainContent组件 */}
            <MainContent 
              isDarkMode={isDarkMode}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              activeTab={activeTab}
              tabs={tabs}
              renderContent={renderContent}
            />
          </motion.div>
        </motion.div>
        
        {/* 使用Footer组件替换原有页脚，添加动画效果 */}
        <motion.div
          layout
          transition={sharedLayoutTransition}
        >
          <Footer darkMode={isDarkMode} showScrollTop={showScrollTop} />
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};

export default UserCenter; 