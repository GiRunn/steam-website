// src/pages/About.jsx
// About页面 - 展示关于我们的详细信息
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

const About = () => {
  // 状态管理
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [aboutData, setAboutData] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const controls = useAnimation();

  // 语言配置
  const translations = {
    en: en,
    zh: zh,
  };
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 获取关于页面数据
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about');
        if (!response.ok) throw new Error('Failed to fetch about data');
        const data = await response.json();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAboutData();
    // 启动入场动画
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

      {/* 主内容区域 */}
      <main className="relative container mx-auto px-4 sm:px-6 py-16">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-center">
            关于我们
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"/>
        </motion.div>

        {/* 公司简介 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          className="mt-16 bg-[#151921] rounded-2xl p-8 border border-gray-800/30"
        >
          <h2 className="text-2xl font-bold mb-6">公司简介</h2>
          <p className="text-gray-400 leading-relaxed">
            {aboutData?.description}
          </p>
        </motion.section>

        {/* 发展历程 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          className="mt-12 bg-[#151921] rounded-2xl p-8 border border-gray-800/30"
        >
          <h2 className="text-2xl font-bold mb-6">发展历程</h2>
          <div className="space-y-8">
            {aboutData?.history?.map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-24 font-bold text-blue-400">
                  {item.year}
                </div>
                <div className="text-gray-400">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 企业文化 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          className="mt-12 bg-[#151921] rounded-2xl p-8 border border-gray-800/30"
        >
          <h2 className="text-2xl font-bold mb-6">企业文化</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-400">我们的使命</h3>
              <p className="text-gray-400 leading-relaxed">
                {aboutData?.mission}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-400">我们的愿景</h3>
              <p className="text-gray-400 leading-relaxed">
                {aboutData?.vision}
              </p>
            </div>
          </div>
        </motion.section>

        
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