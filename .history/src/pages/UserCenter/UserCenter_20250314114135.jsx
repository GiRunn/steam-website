import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Bell,
  Settings,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';
import { authService } from '../../services/authService';
import { logger } from '../../utils/logger';

// 导入组件
import Profile from './components/Profile';
import Security from './components/Security';
import Orders from './components/Orders';
import Balance from './components/Balance';
import Wishlist from './components/Wishlist';
import Posts from './components/Posts';
import Comments from './components/Comments';
import Collections from './components/Collections';
import Social from './components/Social';

const UserCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '账户安全提醒', message: '您的账户已超过30天未修改密码', date: '2024-03-14', read: false },
    { id: 2, title: '愿望单商品降价', message: '您关注的《赛博朋克2077》已降价50%', date: '2024-03-10', read: true },
    { id: 3, title: '订单发货通知', message: '您的订单 #ORD-2024-0001 已发货', date: '2024-03-08', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // 加载用户信息
    const loadUserInfo = () => {
      logger.debug('UserCenter - 加载用户信息');
      const user = authService.getCurrentUser();
      
      if (user) {
        logger.info(`UserCenter - 用户信息加载成功: ${user.username}`);
        setUserInfo(user);
      } else {
        logger.error('UserCenter - 无法获取用户信息，重定向到登录页');
        navigate('/login', { replace: true });
      }
    };
    
    loadUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleUpdateProfile = (updatedInfo) => {
    // 更新用户信息的逻辑
    setUserInfo({
      ...userInfo,
      ...updatedInfo
    });
    // 在实际应用中，这里应该调用API更新用户信息
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'profile', label: '个人信息', icon: User },
    { id: 'orders', label: '订单列表', icon: ShoppingBag },
    { id: 'balance', label: '可用余额', icon: Wallet },
    { id: 'wishlist', label: '关注商品', icon: Heart },
    { id: 'security', label: '账户安全', icon: Shield },
    { id: 'posts', label: '我的发帖', icon: Edit3 },
    { id: 'comments', label: '我的评论', icon: MessageSquare },
    { id: 'collections', label: '我的收藏', icon: Bookmark },
    { id: 'social', label: '粉丝与关注', icon: Users }
  ];

  const renderContent = () => {
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
  };

  if (!userInfo) return (
    <div className="min-h-screen bg-[#1b2838] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-500/30 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-600 rounded mb-3"></div>
        <div className="h-3 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1b2838]' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* 顶部导航栏 */}
      <header className={`${isDarkMode ? 'bg-[#2a475e]/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`mr-4 p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-[#1b2838]/50' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>用户中心</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-[#1b2838]/50' : 'hover:bg-gray-200'} relative`}
                >
                  <Bell className={`h-6 w-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'bg-[#2a475e] border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-20`}>
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>通知</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleMarkAllNotificationsAsRead}
                          className="text-xs text-blue-400 hover:text-blue-500"
                        >
                          全部已读
                        </button>
                        <button 
                          onClick={handleClearNotifications}
                          className="text-xs text-red-400 hover:text-red-500"
                        >
                          清空
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b ${isDarkMode ? 'border-gray-700 hover:bg-[#1b2838]/50' : 'border-gray-200 hover:bg-gray-100'} cursor-pointer ${!notification.read ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
                          >
                            <div className="flex justify-between">
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{notification.title}</h4>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notification.date}</span>
                            </div>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notification.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          暂无通知
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-[#1b2838]/50' : 'hover:bg-gray-200'}`}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6 text-gray-300" />
                ) : (
                  <Moon className="h-6 w-6 text-gray-600" />
                )}
              </button>
              
              <div className="flex items-center">
                <img 
                  src={userInfo.avatar} 
                  alt="用户头像" 
                  className="h-8 w-8 rounded-full object-cover border-2 border-blue-500/30"
                />
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{userInfo.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex">
          {/* 侧边栏 */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-64 flex-shrink-0 mr-6"
              >
                <div className={`sticky top-24 ${isDarkMode ? 'bg-[#2a475e]/50' : 'bg-white'} rounded-lg p-4 space-y-2 ${isDarkMode ? 'shadow-blue-900/5' : 'shadow-lg'} shadow-lg`}>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                          transition-all duration-200 ${
                            activeTab === tab.id
                              ? isDarkMode 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                : 'bg-blue-500 text-white shadow-md'
                              : isDarkMode
                                ? 'text-gray-300 hover:bg-[#1b2838]/70'
                                : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                  
                  {/* 分隔线 */}
                  <div className={`my-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                  
                  {/* 额外选项 */}
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        isDarkMode
                          ? 'text-gray-300 hover:bg-[#1b2838]/70'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>设置</span>
                  </button>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        isDarkMode
                          ? 'text-gray-300 hover:bg-[#1b2838]/70'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>帮助中心</span>
                  </button>
                  
                  {/* 登出按钮 */}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                      transition-colors duration-200 ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-red-500/10'
                          : 'text-red-500 hover:bg-red-50'
                      }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>退出登录</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 主要内容区 */}
          <motion.div
            layout
            className="flex-1"
          >
            <div className={`${isDarkMode ? 'bg-[#2a475e]/50' : 'bg-white'} rounded-lg p-6 shadow-lg ${isDarkMode ? 'shadow-blue-900/5' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                {isCollapsed && (
                  <button
                    onClick={() => setIsCollapsed(false)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-[#1b2838]/50' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* 页脚 */}
      <footer className={`mt-12 py-6 ${isDarkMode ? 'bg-[#2a475e]/30 border-t border-gray-700' : 'bg-gray-50 border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2024 Steam Website. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>隐私政策</a>
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>服务条款</a>
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserCenter; 