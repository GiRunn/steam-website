// src/pages/About.jsx
// About页面 - 展示公司介绍的视频图文单页面

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Navbar from '../components/Navbar';
import enLocale from '../locales/en';
import zhLocale from '../locales/zh';
import Footer from '../components/Footer';
import { aboutContent } from '../components/aboutContent';

// 视频播放器组件
const VideoPlayerModal = ({ videoUrl, show, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-7xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <motion.iframe
            src={videoUrl}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full rounded-2xl shadow-2xl"
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute right-4 sm:right-8 top-4 sm:top-8 rounded-full bg-white/20 p-2 backdrop-blur-md transition-colors hover:bg-white/30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
};


const About = () => {
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [aboutData] = useState(aboutContent);  
  const [showVideo, setShowVideo] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    });

    const handleScroll = () => {
      const sections = document.querySelectorAll('.about-section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controls]);

  return (
    <div className="min-h-screen bg-[#0a0f16] text-gray-100">
      <Navbar
        locale={locale}
        toggleLocale={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      />

      <main className="relative w-full min-h-screen py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          className="container mx-auto px-4 sm:px-6 mb-16 text-center"
        >
          <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">
            {aboutData.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {aboutData.subtitle}
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="about-section relative w-full h-[600px] mb-24"
        >
          <div className="relative h-full rounded-2xl overflow-hidden border border-gray-800/30">
            <img
              src={aboutData.videoPoster}
              alt="Video Cover"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 m-auto w-20 h-20 bg-blue-500/90 hover:bg-blue-600/90 rounded-full flex items-center justify-center transform hover:scale-105 transition-all group cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-white ml-1"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </div>
        </motion.section>

        {aboutData.sections.map((section, index) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className={`about-section container mx-auto px-4 sm:px-6 mb-24 ${
              currentSection === index ? 'opacity-100' : 'opacity-70'
            }`}
          >
            <div className="bg-[#151921] rounded-2xl p-8 sm:p-12 border border-gray-800/30 hover:border-gray-700/30 transition-all duration-300 ease-out transform hover:-translate-y-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">{section.title}</h2>
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-gray-400 leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-video rounded-xl overflow-hidden"
                >
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.section>
        ))}
      </main>

      <VideoPlayerModal 
        videoUrl={aboutData.videoUrl}
        show={showVideo}
        onClose={() => setShowVideo(false)}
      />

      <Footer locale={locale} t={locale === 'zh' ? zhLocale : enLocale} />
    </div>
  );
};

export default About;