import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Search, ChevronDown, ShoppingCart, Heart, Bell, User, Globe, Sun, Moon, MessageCircle, Library, LogIn, LogOut, Download, Settings, Play, HelpCircle } from 'lucide-react';

// UserMenuItem 组件 - 用于用户菜单的每个选项
const UserMenuItem = ({ icon: Icon, text, count, className = "text-gray-300", onClick }) => (
  <motion.a
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/5 ${className} cursor-pointer`}
    whileHover={{ x: 4 }}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
    {count && (
      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </motion.a>
);

// SearchSuggestions 组件 - 搜索建议下拉框
const SearchSuggestions = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute w-full mt-2 py-2 bg-[#1e2837] rounded-xl shadow-xl border border-white/10 z-10"
      >
        <div className="px-4 py-1 text-xs text-gray-400 uppercase">快捷搜索</div>
        <div className="hover:bg-white/5 px-4 py-2 text-gray-300 cursor-pointer">热门游戏</div>
        <div className="hover:bg-white/5 px-4 py-2 text-gray-300 cursor-pointer">新品上市</div>
        <div className="hover:bg-white/5 px-4 py-2 text-gray-300 cursor-pointer">特惠促销</div>
      </motion.div>
    )}
  </AnimatePresence>
);

// SupportMenuDropdown 组件 - 支持菜单下拉框
const SupportMenuDropdown = ({ show, onMouseEnter, onMouseLeave }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full right-0 mt-2 w-64 py-2 bg-[#1e2837] rounded-xl shadow-xl border border-white/10"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Link to="/support">
          <motion.div className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5" whileHover={{ x: 5 }}>
            <MessageCircle className="w-4 h-4" />
            <span>客户支持</span>
          </motion.div>
        </Link>
        <Link to="/video-guides">
          <motion.div className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5" whileHover={{ x: 5 }}>
            <Play className="w-4 h-4" />
            <span>使用视频指导</span>
          </motion.div>
        </Link>
        <Link to="/download-center">
          <motion.div className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5" whileHover={{ x: 5 }}>
            <Download className="w-4 h-4" />
            <span>下载中心</span>
          </motion.div>
        </Link>
      </motion.div>
    )}
  </AnimatePresence>
);

// UserMenuDropdown 组件 - 用户菜单下拉框
const UserMenuDropdown = ({ show, user, onMouseEnter, onMouseLeave, navigate, handleLogout }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 w-64 py-2 bg-[#1e2837] rounded-xl shadow-xl border border-white/10"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="px-4 py-2 border-b border-white/10">
          <p className="text-white font-medium">{user?.username || '用户名'}</p>
          <p className="text-sm text-gray-400">钱包余额: ¥{user?.balance?.toFixed(2) || '0.00'}</p>
        </div>
        <UserMenuItem icon={User} text="个人资料" onClick={() => navigate('/profile')} />
        <UserMenuItem icon={Library} text="我的游戏库" onClick={() => navigate('/library')} />
        <UserMenuItem icon={Heart} text="愿望清单" count={user?.wishlist?.length || 0} onClick={() => navigate('/wishlist')} />
        <UserMenuItem icon={MessageCircle} text="消息" count={user?.messages?.length || 0} onClick={() => navigate('/messages')} />
        <UserMenuItem icon={Settings} text="设置" onClick={() => navigate('/settings')} />
        <div className="border-t border-white/10 mt-2">
          <UserMenuItem icon={LogOut} text="退出登录" className="text-red-400" onClick={handleLogout} />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 主导航栏组件
const Navbar = ({ darkMode, toggleDarkMode, locale, toggleLocale }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
        setIsVisible(direction === 'up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, scrollDirection]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-steam-dark/90 backdrop-blur-md border-b border-white/5"
      initial={{ y: 0, opacity: 1 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.3 }
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* 左侧 Logo和搜索 */}
          <motion.div 
            className="flex items-center gap-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              GAME STORE
            </Link>

            {/* 搜索框 */}
            <div className="relative group">
              <motion.div
                className="relative"
                initial={{ width: 300 }}
                whileHover={{ width: 400 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <input
                  type="text"
                  placeholder="搜索游戏、内容..."
                  className="w-full h-10 pl-12 pr-4 rounded-full bg-[#316282]/30 text-white placeholder-gray-400 outline-none border border-transparent focus:border-steam-blue/50 focus:bg-[#316282]/50 transition-all duration-300"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400 group-hover:text-steam-blue transition-colors" />
                </div>
              </motion.div>
              <SearchSuggestions show={showSuggestions} />
            </div>
          </motion.div>

          {/* 中间导航 */}
          <div className="flex items-center justify-center space-x-12">
            {['商店', '社区', '关于'].map((item) => (
              <motion.div key={item} className="relative">
                <Link
                  to={item === '商店' ? '/store' : item === '社区' ? '/community' : item === '关于' ? '/about' : `/${item.toLowerCase()}`}
                  className={`relative text-gray-300 hover:text-white font-medium ${
                    location.pathname === (item === '商店' ? '/store' : item === '社区' ? '/community' : item === '关于' ? '/about' : `/${item.toLowerCase()}`)
                      ? 'text-white'
                      : ''
                  }`}
                >
                  {item}
                  {location.pathname === (item === '商店' ? '/store' : item === '社区' ? '/community' : item === '关于' ? '/about' : `/${item.toLowerCase()}`) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-steam-blue"
                      layoutId="navIndicator"
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* 支持菜单 */}
            <div className="relative">
              <motion.button
                className="flex items-center gap-1.5 text-gray-300 hover:text-white font-medium"
                whileHover={{ y: -2 }}
                onMouseEnter={() => setShowSupportMenu(true)}
                onMouseLeave={() => setShowSupportMenu(false)}
              >
                支持
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSupportMenu ? 'rotate-180' : ''}`} />
              </motion.button>
              <SupportMenuDropdown 
                show={showSupportMenu}
                onMouseEnter={() => setShowSupportMenu(true)}
                onMouseLeave={() => setShowSupportMenu(false)}
              />
            </div>
          </div>

          {/* 右侧用户区域 */}
          <div className="flex items-center gap-6">
            {/* 主题切换 */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              onClick={toggleDarkMode}
            >
              {darkMode ? 
                <Sun className="w-5 h-5 text-yellow-400" /> : 
                <Moon className="w-5 h-5 text-blue-400" />
              }
            </motion.button>

            {/* 语言切换 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              onClick={toggleLocale}
            >
              <Globe className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.button>

            {/* 用户状态 */}
            {user ? (
              <div className="flex items-center gap-4">
                {/* 购物车 */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <button 
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-300" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
                      {user?.cartItems?.length || 0}
                    </span>
                  </button>
                </motion.div>

                {/* 通知 */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <button 
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell className="w-5 h-5 text-gray-300" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {user?.notifications?.length || 0}
                    </span>
                  </button>
                </motion.div>

                {/* 用户菜单 */}
                <div className="relative">
                  <motion.button
                    className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <img 
                      src={user.avatar || "/api/placeholder/32/32"} 
                      alt="用户头像"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-300 font-medium">{user?.username}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 
                      ${showUserMenu ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <UserMenuDropdown 
                    show={showUserMenu}
                    user={user}
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                    navigate={navigate}
                    handleLogout={handleLogout}
                  />
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full
                  bg-gradient-to-r from-blue-500 to-purple-500
                  hover:from-blue-600 hover:to-purple-600
                  text-white font-medium shadow-lg"
                onClick={() => navigate('/login')}
              >
                <LogIn className="w-5 h-5" />
                <span>登录</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;