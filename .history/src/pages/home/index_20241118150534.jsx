// src/pages/home/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// 组件导入
import HeroSlider from './components/HeroSlider';
import BrandShowcase from './components/BrandShowcase';
import VideoSection from './components/VideoSection';

import ProductFeatures from './components/ProductFeatures';
import GameShowcase from '../../components/GameCard/index';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// 常量导入
import { MOCK_GAMES, MOCK_VIDEOS, MOCK_OFFERS, MOCK_PARTNERS } from './constants';

// 本地化导入
import enLocale from '../../locales/en';
import zhLocale from '../../locales/zh';

// 样式导入
import './styles.css';

const Homepage = () => {
  // 状态管理
  const [locale, setLocale] = useState(() => localStorage.getItem('language') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);

  // refs
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // 处理拖动事件
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX - dragOffset);
    cancelAnimationFrame(animationRef.current);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startAutoScroll();
  };

  // 自动滚动
  const startAutoScroll = () => {
    const animate = () => {
      setDragOffset(prev => {
        const newOffset = prev + 2;
        return newOffset >= containerRef.current?.scrollWidth ? 0.5 : newOffset;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // 副作用处理
  useEffect(() => {
    startAutoScroll();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // 获取语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 幻灯片数据
  const slides = [
    { id: 1, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 1` },
    { id: 2, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 2` },
    { id: 3, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 3` }
  ];

  return (
    <div className={`homepage ${darkMode ? 'dark' : ''}`}>
      <div className="background-gradient"/>
      
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        locale={locale}
        toggleLocale={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      />

      <main className="main-content">
        <HeroSlider 
          slides={slides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
        
        <ProductFeatures />
        <GameShowcase />

        <VideoSection 
          videoList={MOCK_VIDEOS}
          setShowVideo={setShowVideo}
        />


        <BrandShowcase brandLogos={MOCK_PARTNERS} />


      </main>

      <Footer 
        darkMode={darkMode}
        t={t}
        showVideo={showVideo}
        setShowVideo={setShowVideo}
        showScrollTop={showScrollTop} // 添加此prop
      />
    </div>
  );
};

export default Homepage;