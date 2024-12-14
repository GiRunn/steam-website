import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Moon, Sun, ArrowUp, Menu, Globe, Play, Clock, Tag } from 'lucide-react';
import enLocale from '../locales/en';
import zhLocale from '../locales/zh';

const Homepage = () => {
  // 所有状态声明放在一起
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

  // 添加滚动监听效果
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

  // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // 添加 useEffect 来监听暗色模式变化
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 切换语言
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    setLocale(newLocale);
    localStorage.setItem('language', newLocale);
  };

  // 模拟数据
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

  // 在其他 const 声明附近添加
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

    // 添加游戏特性数据
    const gameFeatures = [
      {
        icon: '🎮',
        title: '沉浸体验',
        description: '身临其境的游戏世界'
      },
      {
        icon: '🌍',
        title: '开放世界',
        description: '自由探索的广阔天地'
      },
      {
        icon: '⚔️',
        title: '精彩战斗',
        description: '紧张刺激的战斗系统'
      },
      {
        icon: '🎨',
        title: '精美画面',
        description: '震撼人心的视觉效果'
      }
    ];

  // 特惠游戏数据
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
    <div className="min-h-screen bg-steam-primary">
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
            {/* 原有的导航栏内容 */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-white hover:text-steam-blue transition-colors duration-300">
                GAME STORE
              </span>
              <div className="hidden md:flex ml-10 space-x-8">
                {/* 导航链接，添加悬浮动画 */}
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
            
            <div className="flex items-center space-x-4">
              {/* 搜索框添加动画效果 */}
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
              
              {/* 按钮添加动画效果 */}
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
                {/* 悬浮效果遮罩 */}
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
                
                {/* 悬浮时显示的购买按钮 */}
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

      {/* 视频宣传部分 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-white">{t.promo.video}</h2>
        <div className="relative bg-steam-light rounded-lg overflow-hidden">
          <div className="relative aspect-video cursor-pointer" onClick={() => setShowVideo(true)}>
            <img 
              src="https://picsum.photos/1920/1080" 
              alt="Video Thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <button className="bg-steam-blue p-4 rounded-full hover:bg-opacity-80 transition-all">
                <Play className="h-8 w-8 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      
      
      {/* 动态背景效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-steam-blue/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-steam-purple/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
      </div>
  
       <div className="container mx-auto px-4 relative z-10">
      {/* 主标题区域 */}
      <div 
        className={`
          text-center mb-16 transform transition-all duration-1000
          ${isVisible 
            ? 'translate-y-0 opacity-100' 
            : scrollDirection === 'up' 
              ? 'translate-y-20 opacity-0' 
              : '-translate-y-20 opacity-0'
          }
        `}
      >
        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-steam-blue to-steam-blue-light mb-6">
          {t.sections.gameIntro.title}
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {t.sections.gameIntro.description}
        </p>
      </div>

    {/* 特性卡片 */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {gameFeatures.map((feature, index) => (
        <div 
          key={index}
          className={`
            group
            bg-gradient-to-br from-steam-secondary to-steam-dark
            p-6 rounded-lg shadow-steam
            hover:shadow-steam-hover
            transform transition-all duration-500
            hover:scale-105 hover:-translate-y-2
            ${isVisible 
              ? 'translate-y-0 opacity-100' 
              : scrollDirection === 'up'
                ? 'translate-y-20 opacity-0'
                : '-translate-y-20 opacity-0'
            }
          `}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-steam-blue transition-colors">
            {feature.title}
          </h3>
          <p className="text-gray-300 group-hover:text-gray-100 transition-colors">
            {feature.description}
          </p>
        </div>
      ))}
    </div>

    {/* 游戏截图展示 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div 
        className={`
          space-y-6 transform transition-all duration-1000
          ${isVisible 
            ? 'translate-x-0 opacity-100'
            : scrollDirection === 'up'
              ? 'translate-x-20 opacity-0'
              : '-translate-x-20 opacity-0'
          }
        `}
      >
        <h3 className="text-3xl font-bold text-white">
          震撼的游戏画面
        </h3>
        <p className="text-gray-300 text-lg leading-relaxed">
          使用最新的图形技术，为您呈现出色的视觉效果和流畅的游戏体验。
        </p>
        <button className="
          relative overflow-hidden
          bg-steam-blue text-white px-8 py-3 rounded-lg
          group hover:shadow-steam
          transform hover:translate-y-[-2px] transition-all duration-300
        ">
          <span className="relative z-10">{t.buttons.learnMore}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-steam-blue-light to-steam-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </button>
      </div>
      
      <div 
        className={`
          relative group transform transition-all duration-1000
          ${isVisible 
            ? 'translate-x-0 opacity-100'
            : scrollDirection === 'up'
              ? '-translate-x-20 opacity-0'
              : 'translate-x-20 opacity-0'
          }
        `}
      >
        <div className="relative overflow-hidden rounded-lg">
          <img 
            src="https://picsum.photos/600/400" 
            alt="Game Screenshot"
            className="rounded-lg transform transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-steam-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div className="absolute -bottom-4 -right-4 bg-steam-blue rounded-lg p-4 shadow-steam transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
          <span className="text-white font-bold text-xl">2024</span>
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

      {/* 特别优惠部分 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-white">{t.promo.specialOffers}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialOffers.map((offer) => (
            <div key={offer.id} className="bg-steam-light rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <img 
                  src={offer.image} 
                  alt={offer.title}
                  className="w-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-steam-blue px-4 py-2 rounded-bl-lg">
                  <span className="text-white font-bold">-{offer.discount}% {t.promo.discount}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{offer.title}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      {t.promo.endTime} {offer.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-steam-blue" />
                    <span className="text-gray-400 line-through text-sm">${offer.originalPrice}</span>
                    <span className="text-steam-blue font-bold">${offer.currentPrice}</span>
                  </div>
                </div>
                
                <button className="w-full bg-steam-blue text-white py-2 rounded hover:bg-opacity-80 transition-all">
                  {t.promo.buyNow}
                </button>
              </div>
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
                {/* 社交媒体图标 */}
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    {/* Twitter/X icon */}
                  </svg>
                </a>
                {/* 添加更多社交媒体图标 */}
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