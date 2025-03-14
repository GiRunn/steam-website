// Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp, 
  Store, 
  Home, 
  MessageCircle,
  HelpCircle,
  Phone,
  Mail,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  Info,
  UserPlus,
  LogIn
} from 'lucide-react';

const Footer = ({ darkMode, t = {}, showVideo, setShowVideo, showScrollTop }) => {
  const [hoveredSection, setHoveredSection] = useState(null);

  // 默认文本
  const footerText = t?.footer || {
    about: '关于我们',
    company: '公司介绍',
    store: '游戏商城',
    community: '社区',
    support: '支持中心',
    service: '客户服务',
    FAQ: '常见问题',
    contact: '联系我们',
    workorder: '工单系统',
    legal: '法律信息',
    privacy: '隐私政策',
    terms: '服务条款',
    followUs: '关注我们',
    copyright: '版权所有'
  };

  // 页脚导航项定义
  const footerSections = [
    {
      id: 'main',
      title: '主要',
      items: [
        { name: '首页', icon: Home, path: '/' },
        { name: '游戏商城', icon: Store, path: '/store' },
        { name: '社区', icon: MessageCircle, path: '/community' },
        { name: '关于我们', icon: Info, path: '/about' }
      ]
    },
    {
      id: 'support',
      title: '支持',
      items: [
        { name: '客户服务', icon: HelpCircle, path: '/support' },
        { name: '视频指南', icon: Youtube, path: '/video-guides' },
        { name: '在线客服', icon: MessageCircle, path: '/support' },
        { name: '工单系统', icon: Mail, path: '/support' }
      ]
    },
    {
      id: 'account',
      title: '账户',
      items: [
        { name: '登录', icon: LogIn, path: '/login' },
        { name: '注册', icon: UserPlus, path: '/register' }
      ]
    }
  ];

  // 页脚动画配置
  const footerAnimation = {
    initial: { opacity: 0.9, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0.9, y: 20 }
  };

  // 内容动画配置
  const contentAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, y: 10 }
  };

  return (
    <>
      <motion.footer 
        className={`relative mt-20 ${darkMode ? 'bg-[#1e2837]' : 'bg-gray-900'} overflow-hidden`}
        layout
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 0.8
        }}
        {...footerAnimation}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}
          />
          <motion.div 
            className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        {/* 主要内容 */}
        <motion.div 
          className="relative container mx-auto px-4 py-16"
          {...contentAnimation}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {footerSections.map((section) => (
              <motion.div
                key={section.id}
                className="space-y-6"
                onHoverStart={() => setHoveredSection(section.id)}
                onHoverEnd={() => setHoveredSection(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: footerSections.findIndex(s => s.id === section.id) * 0.1
                }}
              >
                <h3 className="text-xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-blue-400 to-purple-400">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.items.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className="group flex items-center gap-3 text-gray-400 
                          hover:text-white transition-colors duration-300"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 
                            transition-colors duration-300"
                        >
                          <item.icon className="w-4 h-4" />
                        </motion.div>
                        <span className="transform group-hover:translate-x-1 
                          transition-transform duration-300">
                          {item.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* 社交媒体和联系方式 */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0.3
              }}
            >
              <h3 className="text-xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 to-purple-400">
                关注我们
              </h3>
              <div className="flex flex-wrap gap-4">
                {[Twitter, Facebook, Instagram, Github].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 
                      text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>

              <div className="space-y-4 mt-8">
                <motion.a
                  href="tel:400-123-4567"
                  className="flex items-center gap-3 text-gray-400 hover:text-white 
                    transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>400-123-4567</span>
                </motion.a>
                <motion.a
                  href="mailto:support@example.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-white 
                    transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>support@example.com</span>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* 分隔线 */}
          <motion.div 
            className="relative mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
          </motion.div>

          {/* 版权信息 */}
          <motion.div 
            className="mt-16 pt-8 flex flex-col items-center justify-center space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="flex items-center gap-2 text-gray-400"
              whileHover={{ scale: 1.05 }}
            >

            </motion.div>
            <p className="text-gray-400 text-center">
              © 2024 Game Store. {footerText.copyright}
            </p>
          </motion.div>
        </motion.div>
      </motion.footer>

      {/* 视频弹窗 */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 
              flex items-center justify-center"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-4xl aspect-video bg-black rounded-xl 
                overflow-hidden"
            >
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Game Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
                  gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 返回顶部按钮 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-3 rounded-full
              bg-gradient-to-r from-blue-500 to-purple-500
              text-white shadow-lg shadow-blue-500/20 z-40"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;
