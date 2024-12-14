// src/pages/About/index.jsx
// About 页面 - 展示公司信息的主页面组件
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HeroSection } from './components/HeroSection';
import { InfoCard } from './components/InfoCard';
import { ContactSection } from './components/ContactSection';

// 子组件：Hero 区域
const HeroSection = ({ title, description, controls }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      custom={0}
      className="text-center max-w-3xl mx-auto"
    >
      <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
        {title}
      </h1>
      <p className="text-xl text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

// 子组件：信息卡片
const InfoCard = ({ title, content, linkTo, animate = true }) => {
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
      variants={animate ? cardVariants : {}}
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

// 子组件：联系我们区域
const ContactSection = () => {
  return (
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
  );
};

// 主组件
const About = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [aboutData, setAboutData] = useState(null);
  const controls = useAnimation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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
    controls.start();
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
        <HeroSection
          title={aboutData?.title}
          description={aboutData?.description}
          controls={controls}
        />

        {/* 信息卡片区域 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <InfoCard
            title="我们的使命"
            content={aboutData?.mission}
            linkTo="/mission"
          />
          <InfoCard
            title="我们的愿景"
            content={aboutData?.vision}
            linkTo="/vision"
          />
        </div>

        {/* 联系我们区域 */}
        <ContactSection />
      </main>

      {/* 页脚 */}
      <Footer
        darkMode={darkMode}
        t={locale === 'zh' ? zhLocale : enLocale}
        showVideo={showVideo}
        setShowVideo={setShowVideo}
        showScrollTop={showScrollTop}
      />
    </div>
  );
};

export default About;