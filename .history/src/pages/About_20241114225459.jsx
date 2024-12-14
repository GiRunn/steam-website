import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight } from 'lucide-react';
import enLocale from '../locales/en';//页脚
import zhLocale from '../locales/zh';//页脚
import Footer from '../components/Footer';//页脚
import en from '../locales/en';//页脚
import zh from '../locales/zh';//页脚


const About = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [aboutData, setAboutData] = useState(null);
  const controls = useAnimation();
  const [showScrollTop, setShowScrollTop] = useState(false); //页脚
  const [showVideo, setShowVideo] = useState(false); //页脚
  //页脚
  const translations = {
    en: en,
    zh: zh,
  };
    // 获取当前语言包/页脚
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
  }, []);

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5 },
    }));
  }, [controls]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLocale = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-steam-dark text-white">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLocale}
      />

      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2838] via-[#1b2838]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </motion.div>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          custom={0}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {aboutData?.title}
          </h1>
          <p className="text-xl text-gray-300">{aboutData?.description}</p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-[#1e2837] rounded-xl p-8 flex flex-col justify-between"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div>
              <motion.h2
                className="text-3xl font-bold mb-4"
                variants={itemVariants}
              >
                我们的使命
              </motion.h2>
              <motion.p
                className="text-lg text-gray-300"
                variants={itemVariants}
              >
                {aboutData?.mission}
              </motion.p>
            </div>
            <motion.div
              className="mt-8 flex items-center self-end"
              variants={itemVariants}
            >
              <Link to="/mission">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center py-2 px-4 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  了解更多
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-[#1e2837] rounded-xl p-8 flex flex-col justify-between"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div>
              <motion.h2
                className="text-3xl font-bold mb-4"
                variants={itemVariants}
              >
                我们的愿景
              </motion.h2>
              <motion.p
                className="text-lg text-gray-300"
                variants={itemVariants}
              >
                {aboutData?.vision}
              </motion.p>
            </div>
            <motion.div
              className="mt-8 flex items-center self-end"
              variants={itemVariants}
            >
              <Link to="/vision">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center py-2 px-4 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  了解更多
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          custom={4}
          className="mt-16 text-center"
        >
          <Link to="/support">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center py-3 px-6 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span>联系我们</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </Link>
        </motion.div>
      </main>

      {/* 页脚 */}
        <div className={darkMode ? 'dark' : ''}>
          <Footer
            darkMode={darkMode}
            t={locale === 'zh' ? zhLocale : enLocale}  // 确保正确传递翻译对象
            showVideo={showVideo}
            setShowVideo={setShowVideo}
            showScrollTop={showScrollTop}
          />
        </div>
    </div>
  );
};

export default About;