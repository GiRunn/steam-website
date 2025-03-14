// Footer.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Github, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  ArrowUp 
} from 'lucide-react';

const Footer = ({ theme, showScrollTop = false }) => {
  // 默认样式，当theme对象不可用时使用
  const defaultStyles = {
    background: {
      footer: 'bg-gray-900',
      scrollTop: 'bg-blue-500'
    },
    border: {
      primary: 'border-gray-700'
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      link: 'text-blue-400',
      linkHover: 'hover:text-blue-300',
      highlight: 'text-blue-400',
      scrollTop: 'text-white'
    },
    icon: {
      social: 'text-gray-400',
      socialHover: 'hover:text-white'
    }
  };
  
  // 使用theme对象或默认样式
  const styles = theme || defaultStyles;
  
  // 页脚链接
  const links = [
    { name: '关于我们', href: '/about' },
    { name: '联系方式', href: '/contact' },
    { name: '隐私政策', href: '/privacy' },
    { name: '服务条款', href: '/terms' },
    { name: '退款政策', href: '/refund' },
    { name: '帮助中心', href: '/help' }
  ];

  // 社交媒体链接
  const socialLinks = [
    { name: 'Github', icon: Github, href: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'Youtube', icon: Youtube, href: 'https://youtube.com' }
  ];

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 链接动画
  const linkAnimation = {
    whileHover: { 
      x: 3,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    },
    whileTap: { scale: 0.95 }
  };

  // 社交图标动画
  const socialIconAnimation = {
    whileHover: { 
      scale: 1.1,
      y: -2,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    },
    whileTap: { scale: 0.9 }
  };

  // 返回顶部按钮动画
  const scrollTopAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 }
    },
    whileHover: { 
      scale: 1.1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    },
    whileTap: { scale: 0.9 }
  };

  return (
    <footer className={`${styles.background.footer} border-t ${styles.border.primary} py-8 mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 公司信息 */}
          <div>
            <motion.h3 
              className={`text-lg font-semibold mb-4 ${styles.text.primary}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Steam游戏商城
            </motion.h3>
            <motion.p 
              className={`${styles.text.secondary} mb-4 text-sm`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              提供最新、最热门的游戏，让您的游戏体验更加丰富多彩。我们致力于为玩家提供最优质的服务和最具竞争力的价格。
            </motion.p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.icon.social} hover:${styles.icon.socialHover}`}
                    aria-label={link.name}
                    {...socialIconAnimation}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* 链接列表 */}
          <div className="md:col-span-2">
            <motion.h3 
              className={`text-lg font-semibold mb-4 ${styles.text.primary}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              快速链接
            </motion.h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {links.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`${styles.text.link} ${styles.text.linkHover} text-sm`}
                  {...linkAnimation}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <motion.div 
          className={`mt-8 pt-6 border-t ${styles.border.primary} flex flex-col sm:flex-row justify-between items-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className={`${styles.text.tertiary} text-sm text-center sm:text-left`}>
            &copy; {new Date().getFullYear()} Steam游戏商城. 保留所有权利.
          </p>
          <p className={`${styles.text.tertiary} text-sm mt-2 sm:mt-0`}>
            由 <span className={styles.text.highlight}>Steam团队</span> 精心打造
          </p>
        </motion.div>
      </div>

      {/* 返回顶部按钮 */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 p-3 rounded-full ${styles.background.scrollTop} ${styles.text.scrollTop} shadow-lg`}
          aria-label="返回顶部"
          {...scrollTopAnimation}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </footer>
  );
};

export default memo(Footer);
