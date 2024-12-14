import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Moon, Sun, ArrowUp, Menu, Globe, Play, Clock, Tag , ArrowRight} from 'lucide-react';
import enLocale from '../locales/en';
import zhLocale from '../locales/zh';


const Homepage = () => {
  // 所有状态声明
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  const [scrollDirection, setScrollDirection] = useState('down');
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const introRef = useRef(null);
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: '极致性能',
      description: '采用最新技术栈，提供流畅的游戏体验'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '全球互联',
      description: '连接世界各地的玩家社区'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: '安全保障',
      description: '强大的安全系统确保账户安全'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
      title: '云端存储',
      description: '自动同步游戏存档和设置'
    }
  ];

  // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      setLastScrollY(currentScrollY);
      setShowScrollTop(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // IntersectionObserver监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1
      }
    );

    if (introRef.current) {
      observer.observe(introRef.current);
    }

    return () => {
      if (introRef.current) {
        observer.unobserve(introRef.current);
      }
    };
  }, []);

  // 暗色模式监听
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 切换语言
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    setLocale(newLocale);
    localStorage.setItem('language', newLocale);
  };

  // 数据定义
  const slides = [
    { id: 1, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 1` },
    { id: 2, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 2` },
    { id: 3, image: "https://picsum.photos/1920/600", title: `${t.featured.game} 3` }
  ];

  const games = [
    { id: 1, title: `${t.featured.game} 1`, price: "$29.99", image: "https://picsum.photos/460/215" },
    { id: 2, title: `${t.featured.game} 2`, price: "$39.99", image: "https://picsum.photos/460/215" },
    { id: 3, title: `${t.featured.game} 3`, price: "$49.99", image: "https://picsum.photos/460/215" },
    { id: 4, title: `${t.featured.game} 4`, price: "$19.99", image: "https://picsum.photos/460/215" }
  ];

  const videoList = [
    {
      id: 1,
      title: '游戏预告片 1',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video1',
    },
    {
      id: 2,
      title: '游戏预告片 2',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video2',
    },
    {
      id: 3,
      title: '游戏预告片 3',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video3',
    },
    {
      id: 4,
      title: '游戏预告片 4',
      thumbnail: 'https://picsum.photos/300/169',
      videoUrl: 'https://www.youtube.com/embed/video4',
    },
  ];

  
  const specialOffers = [
    {
      id: 1,
      title: 'Game Title 1',
      image: 'https://picsum.photos/300/150',
      discount: 75,
      originalPrice: 59.99,
      currentPrice: 14.99,
      endTime: '48:00',
    },
    {
      id: 2,
      title: 'Game Title 2',
      image: 'https://picsum.photos/300/150',
      discount: 50,
      originalPrice: 49.99,
      currentPrice: 24.99,
      endTime: '24:00',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b2838] via-[#1b2838] to-[#2a475e]">
      {/* 导航栏 */}
      <nav className={`
        sticky top-0 z-50 
        bg-steam-dark
        backdrop-blur-sm
        transform transition-all duration-300
        ${scrollDirection === 'up' ? 'translate-y-0' : scrollY > 100 ? '-translate-y-full' : 'translate-y-0'}
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左侧logo和导航链接 */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-white hover:text-steam-blue transition-colors duration-300">
                GAME STORE
              </span>
              <div className="hidden md:flex ml-10 space-x-8">
                <a href="#" className="text-white hover:text-steam-blue transform hover:-translate-y-1 transition-all duration-300">
                  {t.nav.store}
                </a>
                <a href="#" className="text-white hover:text-steam-blue transform hover:-translate-y-1 transition-all duration-300">
                  {t.nav.community}
                </a>
                <a href="#" className="text-white hover:text-steam-blue transform hover:-translate-y-1 transition-all duration-300">
                  {t.nav.about}
                </a>
                <a href="#" className="text-white hover:text-steam-blue transform hover:-translate-y-1 transition-all duration-300">
                  {t.nav.support}
                </a>
              </div>
            </div>
            
            {/* 右侧搜索和按钮 */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={t.nav.search}
                  className="bg-steam-light px-4 py-2 rounded text-white text-sm 
                    focus:outline-none focus:ring-2 focus:ring-steam-blue
                    w-40 focus:w-60 transition-all duration-300"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-steam-blue transition-colors duration-300" />
              </div>
              
              <button
                onClick={toggleLanguage}
                className="p-2 rounded hover:bg-steam-light text-white
                  transform hover:scale-110 transition-all duration-300"
              >
                <Globe className="h-5 w-5" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded hover:bg-steam-light text-white
                  transform hover:scale-110 transition-all duration-300"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 轮播图部分 */}
      <div className="relative h-[600px] overflow-hidden">
        <div
          className="flex transition-transform duration-500 h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
              </div>
            </div>
          ))}
        </div>
        
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
          onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
          onClick={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* 特惠区域 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className={`
          text-2xl font-bold mb-6 text-white
          transform transition-all duration-500
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          {t.featured.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="group relative overflow-hidden rounded-lg bg-steam-secondary
                transform transition-all duration-500
                hover:scale-105 hover:-translate-y-2
                hover:shadow-steam"
              style={{ 
                transitionDelay: `${index * 100}ms`,
                animation: `float ${3 + index * 0.5}s ease-in-out infinite`
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-steam-dark/80 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                </div>
              </div>
              
              <div className="p-4 transform transition-all duration-300">
                <h3 className="text-lg font-semibold text-white group-hover:text-steam-blue transition-colors">
                  {game.title}
                </h3>
                <p className="text-steam-blue mt-2 transform group-hover:scale-110 transition-transform origin-left">
                  {game.price}
                </p>
                
                <button className="
                  mt-4 w-full bg-steam-blue text-white py-2 rounded
                  transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                  transition-all duration-300
                  hover:bg-steam-blue-light
                ">
                  {t.promo.buyNow}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 视频区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient-text">
            {t.videos.moreVideos}
          </h2>
          <button className="text-steam-blue hover:text-white transition-colors group flex items-center gap-2">
            查看全部 
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoList.map((video, index) => (
            <div 
              key={video.id}
              className="relative group transform transition-all duration-500 hover:scale-105"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
                opacity: 0
              }}
              onClick={() => {
                setShowVideo(true);
              }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-blue-500/80 p-3 rounded-full hover:bg-blue-400 transition-all duration-300 hover:scale-110">
                    <Play className="h-12 w-12 text-white" />
                  </button>
                </div>

                {/* 炫光效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
              </div>
              
              <div className="p-4 transform group-hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-white font-medium group-hover:text-steam-blue transition-colors">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 产品特性区域 - 增强版 */}
      <div className="relative py-20 overflow-hidden">
        {/* 背景动效 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#1b2838]/90" />
          <div className="absolute w-full h-full">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px] animate-pulse-slow" />
          </div>
          <div className="absolute inset-0 backdrop-blur-sm" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* 标题部分 */}
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 inline-block">
                产品特性
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                探索游戏的无限可能，体验前所未有的游戏世界
              </p>
              <div className="h-1 w-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>

            {/* 大图展示区 */}
            <div className="mb-20">
              <div className="group relative aspect-[21/9] rounded-xl overflow-hidden">
                <img 
                  src="https://picsum.photos/1920/820" 
                  alt="Feature Highlight"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    震撼视觉体验
                  </h3>
                  <p className="text-lg text-gray-200 max-w-2xl">
                    采用最新渲染技术，带来极致逼真的画面表现，让您沉浸在精心打造的游戏世界中。
                  </p>
                </div>
              </div>
            </div>

            {/* 特性卡片网格 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* 原有的特性卡片代码... */}
            </div>

            {/* 详细特性展示区 */}
            <div className="mt-20 space-y-20">
              {/* 特性1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-block rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-2">
                    <span className="text-blue-400">01 /</span>
                    <span className="text-purple-400"> 特性亮点</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    开放世界探索
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    广阔的游戏世界等待您的探索，每一个角落都蕴藏着独特的故事和惊喜。自由的探索机制让您可以按照自己的节奏体验游戏内容。
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3 text-gray-300">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>无缝大地图</span>
                    </li>
                    <li className="flex items-center space-x-3 text-gray-300">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>动态天气系统</span>
                    </li>
                    <li className="flex items-center space-x-3 text-gray-300">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>丰富的互动玩法</span>
                    </li>
                  </ul>
                </div>
                <div className="relative group">
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src="https://picsum.photos/600/400" 
                      alt="Feature Detail"
                      className="w-full transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                    <span className="text-white font-bold">探索自由</span>
                  </div>
                </div>
              </div>

              {/* 特性2 - 反向布局 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative group order-2 lg:order-1">
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src="https://picsum.photos/600/400" 
                      alt="Feature Detail"
                      className="w-full transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-lg transform group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform">
                    <span className="text-white font-bold">次世代画质</span>
                  </div>
                </div>
                <div className="space-y-6 order-1 lg:order-2">
                  <div className="inline-block rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-2">
                    <span className="text-purple-400">02 /</span>
                    <span className="text-blue-400"> 视觉体验</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    极致画面表现
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    采用最新的图形渲染技术，为您带来震撼的视觉体验。从细腻的材质到逼真的光影效果，每一个细节都经过精心打磨。
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3 text-gray-300">
                      <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>光线追踪</span>
                    </li>
                    {/* ... 更多特性列表 */}
                  </ul>
                </div>
              </div>
            </div>

            {/* 技术规格表 */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-white mb-8">技术规格</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1e2837] rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-white">最低配置要求</h4>
                  {/* 配置详情... */}
                </div>
                <div className="bg-[#1e2837] rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-white">推荐配置要求</h4>
                  {/* 配置详情... */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 更多视频区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t.videos.moreVideos}</h2>
          <button className="text-steam-blue hover:text-white transition-colors">
            查看全部 →
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoList.map((video) => (
            <div 
              key={video.id}
              className="bg-steam-light rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setShowVideo(true);
              }}
            >
              <div className="relative">
                <img 
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 特别优惠区域 */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient-text">
            特别优惠
          </h2>
          <button className="text-blue-400 hover:text-blue-300 transition-colors group flex items-center gap-2">
            查看全部
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialOffers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative bg-[#1e2837] rounded-xl overflow-hidden 
                transform transition-all duration-500 hover:scale-105"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
                opacity: 0
              }}
            >
              {/* 折扣标签 */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full 
                  font-bold text-sm transform rotate-3 animate-pulse">
                  -{offer.discount}%
                </div>
              </div>

              {/* 图片容器 */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover transform transition-transform 
                    duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t 
                  from-[#1e2837] to-transparent opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300" />
                
                {/* 炫光效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
              </div>

              {/* 内容区域 */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 
                  transition-colors duration-300">
                  {offer.title}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm group-hover:text-blue-300 transition-colors">
                      {offer.endTime} 剩余
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 line-through text-sm">
                      ${offer.originalPrice}
                    </span>
                    <span className="text-blue-400 font-bold group-hover:text-blue-300 
                      transition-colors animate-pulse">
                      ${offer.currentPrice}
                    </span>
                  </div>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                  text-white rounded-lg transform transition-all duration-300 
                  hover:from-blue-600 hover:to-blue-700 hover:shadow-lg 
                  hover:shadow-blue-500/25 hover:scale-105">
                  立即购买
                </button>
              </div>

              {/* 装饰边框 */}
              <div className="absolute inset-0 rounded-xl border border-blue-500/0 
                group-hover:border-blue-500/50 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>

       


      {/* 页脚区域 */}
      <footer className={`mt-20 ${darkMode ? 'bg-steam-dark' : 'bg-gray-900'}`}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-white text-lg font-bold">{t.footer.about}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t.footer.company}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t.footer.careers}
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white text-lg font-bold">{t.footer.support}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t.footer.help}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t.footer.contact}
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white text-lg font-bold">{t.footer.legal}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t.footer.privacy}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {t.footer.terms}
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white text-lg font-bold">{t.footer.followUs}</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    {/* Twitter/X icon */}
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-gray-400 text-center">
              © 2024 Game Store. {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
      {/* 视频弹窗 */}
      {showVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={() => setShowVideo(false)}
        >
          <div className="w-full max-w-4xl aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Game Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* 返回顶部按钮 */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-steam-blue text-white p-3 rounded-full shadow-lg hover:bg-opacity-80 transition-all"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Homepage;