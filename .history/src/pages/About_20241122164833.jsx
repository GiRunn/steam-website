// src/pages/About.jsx
// About 页面 - 展示公司信息的主页面组件
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight } from 'lucide-react';
import enLocale from '../locales/en';
import zhLocale from '../locales/zh';
import Footer from '../components/Footer';
import en from '../locales/en';
import zh from '../locales/zh';

// 子组件：信息卡片组件
const InfoCardComponent = ({ title, content, linkTo }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-[#151921] rounded-xl p-8 border border-gray-800/30 hover:border-gray-700/30 transition-colors"
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-100">
            {title}
          </h2>
          <p className="text-gray-400 leading-relaxed">
            {content}
          </p>
        </div>
        
        <Link 
          to={linkTo}
          className="group inline-flex items-center mt-6 text-blue-400 hover:text-blue-300 transition-colors"
        >
          了解更多
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

// 主组件
const About = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  
  const [aboutData, setAboutData] = useState(null);
  const controls = useAnimation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const translations = {
    en: en,
    zh: zh,
  };
  
  // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        if (!response.ok) {
          throw new Error('Failed to fetch about data');
        }
        const data = await response.json();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAboutData();
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5 },
    }));
  }, [controls]);

  return (
    <div className="min-h-screen bg-[#0a0f16] text-gray-100">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        locale={locale}
        toggleLocale={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      />

      {/* 背景装饰 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0f16] bg-opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      </div>

      {/* 主要内容区 */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-16">
        {/* Hero 区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          custom={0}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            {aboutData?.title}
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            {aboutData?.description}
          </p>
        </motion.div>

        {/* 信息卡片区域 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <InfoCardComponent
            title="我们的使命"
            content={aboutData?.mission}
            linkTo="/mission"
          />
          <InfoCardComponent
            title="我们的愿景"
            content={aboutData?.vision}
            linkTo="/vision"
          />
        </div>

        {/* 联系我们区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link to="/support">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-3 rounded-full
                bg-gradient-to-r from-blue-500 to-indigo-500 
                text-white font-medium text-lg
                hover:from-blue-600 hover:to-indigo-600
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-colors"
            >
              联系我们
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </Link>
        </motion.div>
      </main>

      {/* 页脚 */}
      <div className={darkMode ? 'dark' : ''}>
        <Footer
          darkMode={darkMode}
          t={locale === 'zh' ? zhLocale : enLocale}
          showVideo={showVideo}
          setShowVideo={setShowVideo}
          showScrollTop={showScrollTop}
        />
      </div>
    </div>
  );
};

export default About;