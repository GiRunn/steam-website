// src/pages/About.jsx
// About页面 - 展示公司介绍的视频图文单页面
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Navbar from '../components/Navbar';
import enLocale from '../locales/en';
import zhLocale from '../locales/zh';
import Footer from '../components/Footer';
import en from '../locales/en';
import zh from '../locales/zh';
import VideoPlayer from '../components/VideoPlayer';
import { X, Pause, Play, VolumeX, Volume2 } from 'lucide-react'; // 引入缺失的图标组件
import { aboutContent } from '../components/aboutContent';


// VideoPreview子组件 - 视频预览和控制
const VideoPreview = ({ videoUrl, onClose, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full h-full object-cover rounded-xl"
        loop
        muted={isMuted}
        playsInline
      />
      
      {/* 视频控制层 */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 
        transition-opacity duration-300 flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-900/80 hover:bg-gray-800 
              transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 播放控制按钮 */}
        <button
          onClick={togglePlay}
          className="p-4 rounded-full bg-blue-500/90 hover:bg-blue-600 
            transition-all transform hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>

        {/* 音量控制按钮 */}
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 p-2 rounded-full 
            bg-gray-900/80 hover:bg-gray-800 transition-colors text-white"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

const About = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [aboutData, setAboutData] = useState(aboutContent);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const controls = useAnimation();

  const translations = {
    en: en,
    zh: zh,
  };
  
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 动画序列
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    });

    // 监听滚动以更新当前section
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
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        locale={locale}
        toggleLocale={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      />

      {/* 主内容区域 */}
      <main className="relative w-full min-h-screen py-16">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          className="container mx-auto px-4 sm:px-6 mb-16 text-center"
        >
          <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">
            {aboutData.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {aboutData.subtitle}
          </p>
        </motion.div>

        {/* 视频预览区域 */}
      {/* 视频预览区域 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="about-section relative w-full h-[600px] mb-24"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative h-full rounded-2xl overflow-hidden 
            border border-gray-800/30">
            {showVideo ? (
              <VideoPlayer // 使用VideoPlayer组件播放视频
                videoUrl={aboutData.videoUrl}
                poster={aboutData.videoPoster}
                onClose={() => setShowVideo(false)}
              />
            ) : (
                <div className="relative h-full">
                  <img
                    src={aboutData.videoPoster}
                    alt="Video Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 m-auto w-20 h-20 
                      bg-blue-500/90 hover:bg-blue-600/90
                      rounded-full flex items-center justify-center
                      transform hover:scale-105 transition-all
                      group cursor-pointer"
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* 图文内容区域 */}
        {aboutData.sections.map((section, index) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            className={`about-section container mx-auto px-4 sm:px-6 mb-24
              ${currentSection === index ? 'opacity-100' : 'opacity-70'}`}
          >
            <div className="bg-[#151921] rounded-2xl p-8 sm:p-12 
              border border-gray-800/30 hover:border-gray-700/30 
              transition-all duration-300 ease-out
              transform hover:-translate-y-1"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {/* 文本内容 */}
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">{section.title}</h2>
                  <div className="prose prose-invert max-w-none">
                    <div 
                      className="text-gray-400 leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>

                {/* 图片展示 */}
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