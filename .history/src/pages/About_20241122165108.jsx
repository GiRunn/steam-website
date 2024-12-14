// src/pages/About.jsx
// About页面 - 展示公司介绍的单页面
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [aboutData, setAboutData] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const controls = useAnimation();

  const translations = {
    en: en,
    zh: zh,
  };
  
  const t = locale === 'zh' ? zhLocale : enLocale;

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
    controls.start({ opacity: 1, y: 0 });
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          className="max-w-4xl mx-auto bg-[#151921] rounded-2xl p-8 sm:p-12 
            border border-gray-800/30"
        >
          {/* 标题 */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-8">
            关于我们
          </h1>
          
          {/* 内容 */}
          <div className="mt-8 prose prose-invert max-w-none">
            <div 
              className="text-gray-400 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: aboutData?.content }}
            />
          </div>

          {/* 联系我们按钮 */}
          <div className="mt-12 flex justify-center">
            <Link to="/support">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-8 py-3 rounded-full
                  bg-blue-500 hover:bg-blue-600
                  text-white font-medium text-lg
                  transition-colors duration-200"
              >
                联系我们
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </div>
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