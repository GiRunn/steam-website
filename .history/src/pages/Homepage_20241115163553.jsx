// src/pages/Homepage.jsx
import React, { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Clock, ArrowRight } from 'lucide-react';

import PropTypes from 'prop-types';

import enLocale from '../locales/en';
import zhLocale from '../locales/zh';
import MenuStatusList from '../components/MenuStatusList';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { Star, Award, TrendingUp, BarChart2,Heart } from 'lucide-react';
// 1. 添加 framer-motion 导入
import { motion } from 'framer-motion';




// 常量定义
const DISPLAY_TYPES = {
  GRID: 'grid',
  LIST: 'list',
  FEATURED: 'featured'
};

// 2. 添加 MOCK_GAMES 数据
const MOCK_GAMES = [
  {
    id: 1,
    sectionId: 'new-releases',
    title: "赛博朋克 2077",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
    description: "在赛博朋克 2077 这款开放世界动作冒险 RPG 中，您将在夜之城这座权力、魅力和义体改造的都市扮演一名雇佣兵。",
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT RED",
    releaseDate: "2020-12-10",
    tags: [
      { id: 1, name: "开放世界" },
      { id: 2, name: "RPG" },
      { id: 3, name: "赛博朋克" }
    ],
    rating: 4.5,
    originalPrice: 298,
    currentPrice: 149,
    discount: 50,
    videos: [{ id: 1, url: "https://cdn.akamai.steamstatic.com/steam/apps/256812115/movie480.webm" }]
  },
  {
    id: 2,
    sectionId: 'new-releases',
    title: "艾尔登法环",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
    description: "艾尔登法环是一款动作角色扮演游戏，由宫崎英高指导，乔治·R·R·马丁创作背景故事。",
    developer: "FromSoftware",
    publisher: "BANDAI NAMCO",
    releaseDate: "2022-02-25",
    tags: [
      { id: 4, name: "动作" },
      { id: 5, name: "魂系列" },
      { id: 6, name: "角色扮演" }
    ],
    rating: 4.8,
    originalPrice: 398,
    currentPrice: 298,
    discount: 25,
    videos: [{ id: 2, url: "https://cdn.akamai.steamstatic.com/steam/apps/256889456/movie480.webm" }]
  },
  {
    id: 3,
    sectionId: 'top-sellers',
    title: "霍格沃茨之遗",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/990080/header.jpg",
    description: "霍格沃茨之遗是一款开放世界动作RPG。现在开始在霍格沃茨开启您的冒险之旅。",
    developer: "Avalanche Software",
    publisher: "Warner Bros. Games",
    releaseDate: "2023-02-10",
    tags: [
      { id: 7, name: "开放世界" },
      { id: 8, name: "魔法" },
      { id: 9, name: "角色扮演" }
    ],
    rating: 4.7,
    originalPrice: 298,
    currentPrice: 298,
    discount: 0,
    featured: true
  },
  {
    id: 4,
    sectionId: 'top-sellers',
    title: "博德之门3",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg",
    description: "集结你的队伍，重返被遗忘的国度。",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: "2023-08-03",
    tags: [
      { id: 10, name: "角色扮演" },
      { id: 11, name: "回合制" },
      { id: 12, name: "奇幻" }
    ],
    rating: 4.9,
    originalPrice: 298,
    currentPrice: 298,
    discount: 0
  },
  {
    id: 5,
    sectionId: 'specials',
    title: "荒野大镖客：救赎2",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg",
    description: "亚瑟·摩根和范德林德帮派必须在横跨美国腹地的严酷旅程中为生存而战。",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    releaseDate: "2019-12-05",
    tags: [
      { id: 16, name: "开放世界" },
      { id: 17, name: "剧情" },
      { id: 18, name: "西部" }
    ],
    rating: 4.9,
    originalPrice: 279,
    currentPrice: 139.5,
    discount: 50
  },
  {
    id: 6,
    sectionId: 'specials',
    title: "战神",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg",
    description: "克雷多斯与儿子阿特柔斯开始了一段全新的旅程。",
    developer: "Santa Monica Studio",
    publisher: "PlayStation PC LLC",
    releaseDate: "2022-01-14",
    tags: [
      { id: 19, name: "动作" },
      { id: 20, name: "冒险" },
      { id: 21, name: "神话" }
    ],
    rating: 4.9,
    originalPrice: 279,
    currentPrice: 195.3,
    discount: 30
  }
];


const CONTENT_TYPES = {
  NEW: 'new',
  HOT: 'hot',
  RECOMMENDED: 'recommended',
  SPECIAL: 'special'
};

// ==================== Hero轮播图组件 ====================
const HeroSlider = memo(({ slides, currentSlide, setCurrentSlide }) => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(0);
  
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, slides.length, setCurrentSlide]); // 添加 setCurrentSlide 到依赖数组

  // 触摸事件处理
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // 最小滑动距离
      if (diff > 0) {
        // 向左滑
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      } else {
        // 向右滑
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      }
    }
    setIsAutoPlaying(true);
  };

  return (
    <div 
      className="relative h-[600px] overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 轮播内容 */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`min-w-full h-full relative transform transition-transform duration-700
              ${index === currentSlide ? 'scale-100' : 'scale-95'}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* 标题遮罩 */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8
              transform transition-all duration-700 ${
                index === currentSlide 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-10 opacity-0'
              }`}>
              <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 控制按钮 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300
              ${index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/70'}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* 左右箭头 */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full 
          text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300
          hover:bg-black/70"
        onClick={() => {
          setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
          setIsAutoPlaying(false);
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full 
          text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300
          hover:bg-black/70"
        onClick={() => {
          setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
          setIsAutoPlaying(false);
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
});

HeroSlider.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  })).isRequired,
  currentSlide: PropTypes.number.isRequired,
  setCurrentSlide: PropTypes.func.isRequired
};

// 轮播图控制按钮组件
const SliderControls = memo(({ onPrev, onNext }) => {
  return (
    <>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
        onClick={onPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
        onClick={onNext}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </>
  );
});

SliderControls.propTypes = {
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

// ==================== 合作伙伴展示组件 ====================
const BrandShowcase = memo(({ brandLogos, containerRef, dragOffset, isDragging, handlers }) => {
  return (
    <section className="brand-showcase relative py-32 overflow-hidden bg-[#1e2837]">
      <BackgroundDecorations />
      <SectionTitle title="合作伙伴" />
      
      <div className="relative overflow-hidden">
        <div 
          ref={containerRef}
          className="flex items-center select-none"
          style={{
            transform: `translateX(${-dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.5s ease-out'
          }}
          {...handlers}
        >
          {[...brandLogos, ...brandLogos, ...brandLogos].map((brand, index) => (
            <BrandCard key={`${brand.id}-${index}`} brand={brand} />
          ))}
        </div>
        <GradientMasks />
      </div>
    </section>
  );
});

BrandShowcase.propTypes = {
  brandLogos: PropTypes.array.isRequired,
  containerRef: PropTypes.object.isRequired,
  dragOffset: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  handlers: PropTypes.object.isRequired
};
// 背景装饰组件
const BackgroundDecorations = memo(() => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-blue-500/5" />
    <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
  </div>
));

// 标题组件
const SectionTitle = memo(({ title }) => (
  <div className="container mx-auto px-4 mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
      {title}
    </h2>
    <div className="mt-4 w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
  </div>
));

SectionTitle.propTypes = {
  title: PropTypes.string.isRequired
};

// 合作伙伴卡片组件
const BrandCard = memo(({ brand }) => (
  <div className="flex-shrink-0 px-8 w-[600px]">
    <div className="group relative bg-[#2a475e] rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105">
      <div className="relative aspect-[2/1] overflow-hidden">
        <img
          src={brand.image}
          alt={brand.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-2xl font-bold text-white mb-2">{brand.name}</h3>
          <p className="text-gray-300">{brand.description}</p>
        </div>
      </div>
      <BrandCardEffects />
    </div>
  </div>
));

BrandCard.propTypes = {
  brand: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired
};

// 卡片特效组件
const BrandCardEffects = memo(() => (
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
  </div>
));

// 渐变遮罩组件
const GradientMasks = memo(() => (
  <>
    <div className="absolute top-0 left-0 w-1/6 h-full bg-gradient-to-r from-[#1b2838] to-transparent pointer-events-none" />
    <div className="absolute top-0 right-0 w-1/6 h-full bg-gradient-to-l from-[#1b2838] to-transparent pointer-events-none" />
  </>
));



// ==================== 视频展示组件 ====================
const VideoShowcase = memo(({ videoList, setShowVideo }) => {
  const [displayCount, setDisplayCount] = useState(4);
  
  // 加载更多视频
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 4, videoList.length));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-400 to-purple-400">
            精彩视频
          </h2>
          <Link 
            to="/videos" 
            className="text-blue-400 hover:text-blue-300 transition-colors 
              group flex items-center gap-2"
          >
            查看全部
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 
              transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {videoList.slice(0, displayCount).map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              index={index}
              onPlay={() => setShowVideo(true)}
            />
          ))}
        </div>

        {displayCount < videoList.length && (
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg 
                transform transition-all duration-300 hover:bg-blue-600 
                hover:scale-105"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

const VideoPromotions = React.memo(({ t, setShowVideo }) => {
  return (
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
  );
});

// ==================== 产品特性组件 ====================
const ProductFeatures = React.memo(() => {
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

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gameFeatures.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-[#1e2837] p-6 rounded-xl hover:bg-[#2a475e] transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPromotions.propTypes = {
  t: PropTypes.object.isRequired,
  setShowVideo: PropTypes.func.isRequired
};

// 单个视频卡片组件
const VideoCard = React.memo(({ video, index, onPlay }) => {
  return (
    <div 
      className="bg-steam-light rounded-lg overflow-hidden group transform hover:scale-105 transition-all duration-300"
      style={{
        animation: `fadeInUp 0.6s ease-out forwards ${index * 0.15}s`,
        opacity: 0
      }}
      onClick={onPlay}
    >
      <div className="relative">
        <img 
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* 悬浮遮罩 */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="transform group-hover:scale-110 transition-transform duration-300">
            <Play className="h-12 w-12 text-white" />
          </div>
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
  );
});

// ==================== 特别优惠组件 ====================
const SpecialOffers = memo(({ specialOffers }) => {
  const [displayCount, setDisplayCount] = useState(3);
  
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 3, specialOffers.length));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-blue-400 to-purple-400">
            特别优惠
          </h2>
          {/* 修改为按钮，或确保路由中有 /offers 路径 */}
          <button 
            onClick={() => window.location.href = '/offers'}
            className="text-blue-400 hover:text-blue-300 transition-colors 
              group flex items-center gap-2"
          >
            查看全部
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 
              transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialOffers.slice(0, displayCount).map((offer, index) => (
            <OfferCard 
              key={offer.id} 
              offer={offer} 
              index={index} 
            />
          ))}
        </div>

        {displayCount < specialOffers.length && (
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg 
                transform transition-all duration-300 hover:bg-blue-600 
                hover:scale-105"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

// 单个优惠卡片组件
const OfferCard = React.memo(({ offer, index }) => {
  return (
    <div
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
  );
});


// ================ 内部组件定义 ================

// 游戏卡片基础组件
const GameCard = React.memo(({ game, index, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[#1e2837] rounded-xl overflow-hidden hover:shadow-2xl transform transition-all duration-500 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 游戏封面 */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className={`
            w-full h-full object-cover transition-transform duration-700
            ${isHovered ? 'scale-110 blur-sm' : 'scale-100'}
            ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* 加载状态 */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-[#2a475e] animate-pulse" />
        )}

        {/* 折扣标签 */}
        {game.discount > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 
            text-white px-3 py-1 rounded-full font-bold transform rotate-3">
            -{game.discount}%
          </div>
        )}

        {/* 评分 */}
        {game.rating && (
          <div className="absolute top-4 left-4 flex items-center gap-1 
            bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-white">{game.rating}</span>
          </div>
        )}

        {/* 悬浮信息 */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/90 to-black/30
          flex flex-col justify-end p-6 transition-all duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2 mb-4">{game.description}</p>
          
          {/* 游戏标签 */}
          <div className="flex flex-wrap gap-2">
            {game.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs font-medium text-white/80 
                  rounded-full bg-white/10 backdrop-blur-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* 视频预览按钮 */}
          {game.videos?.length > 0 && (
            <button className="mt-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <Play className="w-4 h-4" />
              <span>观看预告片</span>
            </button>
          )}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white group-hover:text-blue-400 
              transition-colors">
              {game.title}
            </h3>
            <p className="text-sm text-gray-400">{game.developer}</p>
          </div>
          <div className="text-right">
            {game.discount > 0 ? (
              <>
                <div className="text-sm text-gray-400 line-through">
                  ¥{game.originalPrice}
                </div>
                <div className="text-lg font-bold text-blue-400">
                  ¥{game.currentPrice}
                </div>
              </>
            ) : (
              <div className="text-lg font-bold text-blue-400">
                ¥{game.currentPrice}
              </div>
            )}
          </div>
        </div>

        {/* 购买按钮 */}
        <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 
          text-white rounded-lg opacity-0 group-hover:opacity-100 transform 
          group-hover:translate-y-0 translate-y-2 transition-all duration-300">
          立即购买
        </button>
      </div>
    </motion.div>
  );
});

// 列表项组件
const GameListItem = React.memo(({ game, index, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#1e2837] rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex p-4 gap-6">
        {/* 游戏封面 */}
        <div className="relative w-48 h-28 flex-shrink-0">
          <img
            src={game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover rounded-lg"
          />
          {game.videos?.length > 0 && (
            <button className="absolute inset-0 flex items-center justify-center 
              bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <Play className="w-8 h-8 text-white" />
            </button>
          )}
        </div>

        {/* 游戏信息 */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{game.title}</h3>
              <p className="text-sm text-gray-400">{game.developer}</p>
              
              {/* 游戏标签 */}
              <div className="flex flex-wrap gap-2 mt-2">
                {game.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs font-medium text-white/80 
                      rounded-full bg-white/10"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 价格信息 */}
            <div className="text-right">
              {game.discount > 0 && (
                <div className="text-sm text-blue-400 font-bold mb-1">
                  -{game.discount}%
                </div>
              )}
              <div className="flex flex-col items-end">
                {game.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ¥{game.originalPrice}
                  </span>
                )}
                <span className="text-lg font-bold text-blue-400">
                  ¥{game.currentPrice}
                </span>
              </div>
            </div>
          </div>

          {/* 游戏描述 - 仅在hover时显示 */}
          <motion.div
            initial={false}
            animate={{
              height: isHovered ? 'auto' : 0,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="mt-3 text-sm text-gray-300 overflow-hidden"
          >
            {game.description}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

// 特色游戏主卡片
const MainFeatureCard = React.memo(({ game, isVisible }) => {
  if (!game) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="group relative aspect-[16/9] rounded-xl overflow-hidden"
    >
      {/* 背景图片 */}
      <img
        src={game.coverImage}
        alt={game.title}
        className="w-full h-full object-cover transform transition-transform 
          duration-700 group-hover:scale-105"
      />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* 内容 */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex justify-between items-start">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-3">{game.title}</h2>
            <p className="text-gray-300 text-lg mb-4">{game.description}</p>
            <div className="flex items-center gap-4">
              {game.tags && (
                <div className="flex gap-2">
                  {game.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-sm font-medium text-white/90 
                        rounded-full bg-white/10 backdrop-blur-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            {game.discount > 0 && (
              <div className="text-xl text-blue-400 font-bold mb-1">
                -{game.discount}%
              </div>
            )}
            <div className="flex flex-col items-end">
              {game.discount > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  ¥{game.originalPrice}
                </span>
              )}
              <span className="text-3xl font-bold text-blue-400">
                ¥{game.currentPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 播放按钮 */}
      {game.videos?.length > 0 && (
        <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 
          -translate-y-1/2 bg-white/20 p-6 rounded-full backdrop-blur-sm
          hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
          <Play className="h-12 w-12 text-white" />
        </button>
      )}
    </motion.div>
  );
});

// 分区图标组件
const SectionIcon = React.memo(({ type }) => {
  const icons = {
    [CONTENT_TYPES.NEW]: <Star className="h-6 w-6 text-yellow-400" />,
    [CONTENT_TYPES.HOT]: <TrendingUp className="h-6 w-6 text-red-400" />,
    [CONTENT_TYPES.RECOMMENDED]: <Award className="h-6 w-6 text-blue-400" />,
    [CONTENT_TYPES.SPECIAL]: <BarChart2 className="h-6 w-6 text-purple-400" />
  };

  return icons[type] || null;
});


// ==================== 主页组件 ====================

// 主页根组件
const Homepage = () => {
  // 状态管理
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
  const [showVideo, setShowVideo] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Refs
  const introRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollRef = useRef(null);

  // Event Handlers
  const handleScroll = () => {
    const currentScrollY = scrollRef.current.scrollTop;
    const direction = currentScrollY > scrollY ? 'down' : 'up';
    setScrollDirection(direction);
    setScrollY(currentScrollY);
  };

  const toggleLanguage = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX - dragOffset);
    cancelAnimationFrame(animationRef.current);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX - dragStartX;
    setDragOffset(x);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startAutoScroll();
  };

  const startAutoScroll = () => {
    let progress = dragOffset;
    const animate = () => {
      progress += 2;
      if (progress >= containerRef.current?.scrollWidth || !containerRef.current) {
        progress = 0.5;
      }
      setDragOffset(progress);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // Effects
  useEffect(() => {
    startAutoScroll();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const handleScrollEffect = () => {
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

    window.addEventListener('scroll', handleScrollEffect, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEffect);
  }, [lastScrollY]);

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

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 获取当前语言包
  const t = locale === 'zh' ? zhLocale : enLocale;

  // Constants
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

  const brandLogos = [
    {
      id: 1,
      name: 'Brand 1',
      image: 'https://picsum.photos/400/200',
      description: '革新科技，引领未来'
    },
    {
      id: 2,
      name: 'Brand 2',
      image: 'https://picsum.photos/400/200',
      description: '探索无限可能'
    },
    {
      id: 3,
      name: 'Brand 3',
      image: 'https://picsum.photos/400/200',
      description: '精益求精，追求卓越'
    },
    {
      id: 4,
      name: 'Brand 4',
      image: 'https://picsum.photos/400/200',
      description: '创新驱动发展'
    },
    {
      id: 5,
      name: 'Brand 5',
      image: 'https://picsum.photos/400/200',
      description: '科技改变生活'
    }
  ];

  // 合并后的渲染逻辑
  return (
    <div className="min-h-screen bg-steam-dark text-white" ref={scrollRef} onScroll={handleScroll}>
      <div className="fixed inset-0 bg-gradient-to-b from-[#1b2838] via-[#1b2838]/50 to-transparent" />
      
      {/* 导航栏 */}
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        locale={locale}
        toggleLocale={toggleLanguage}
      />
  
      {/* 轮播图 */}
      <HeroSlider 
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
  
      {/* 品牌展示区域 */}
      <BrandShowcase 
        brandLogos={brandLogos}
        isDragging={isDragging}
        dragOffset={dragOffset}
        containerRef={containerRef}
        handlers={{
          onDragStart: handleDragStart,
          onDragMove: handleDragMove,
          onDragEnd: handleDragEnd
        }}
      />
  
      <MenuStatusList />
  
      {/* 游戏展示区域 */}
      <div className="py-20 bg-[#1b2838]">
        <div className="container mx-auto px-4 space-y-20">
          {/* 新品推荐 */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Star className="h-6 w-6 text-yellow-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">新品推荐</h2>
                <p className="text-gray-400 mt-1">本周最新上线</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {MOCK_GAMES.filter(game => game.sectionId === 'new-releases').slice(0, 1).map(game => (
                  <MainFeatureCard 
                    key={game.id}
                    game={game}
                    isVisible={isVisible}
                  />
                ))}
              </div>
              <div className="space-y-6">
                {MOCK_GAMES.filter(game => game.sectionId === 'new-releases').slice(1, 3).map((game, index) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    index={index}
                    isVisible={isVisible}
                  />
                ))}
              </div>
            </div>
          </section>
  
          {/* 热销榜单 */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-6 w-6 text-red-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">热销榜单</h2>
                <p className="text-gray-400 mt-1">实时销量排行</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_GAMES
                .filter(game => game.sectionId === 'top-sellers')
                .map((game, index) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    index={index}
                    isVisible={isVisible}
                  />
                ))}
            </div>
          </section>
  
          {/* 特别优惠 */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <BarChart2 className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">特别优惠</h2>
                <p className="text-gray-400 mt-1">限时特惠中</p>
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_GAMES
                .filter(game => game.sectionId === 'specials')
                .map((game, index) => (
                  <GameListItem
                    key={game.id}
                    game={game}
                    index={index}
                    isVisible={isVisible}
                  />
                ))}
            </div>
          </section>
        </div>
      </div>
  
      {/* 视频宣传 */}
      <VideoPromotions t={t} setShowVideo={setShowVideo} />
  
      {/* 产品特性 */}
      <ProductFeatures />
  
      {/* 更多视频 */}
      <VideoShowcase videoList={videoList} setShowVideo={setShowVideo} />
  
      {/* 优惠展示 */}
      <SpecialOffers specialOffers={specialOffers} />
  
      {/* 页脚 */}
      <div className={darkMode ? 'dark' : ''}>
        <Footer
          darkMode={darkMode}
          t={t}
          showVideo={showVideo}
          setShowVideo={setShowVideo}
          showScrollTop={showScrollTop}
        />
      </div>   
    </div>
  );
};



// PropTypes 类型检查
VideoShowcase.propTypes = {
  videoList: PropTypes.array.isRequired,
  setShowVideo: PropTypes.func.isRequired
};

VideoCard.propTypes = {
  video: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onPlay: PropTypes.func.isRequired
};

SpecialOffers.propTypes = {
  specialOffers: PropTypes.array.isRequired
};

OfferCard.propTypes = {
  offer: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

export default Homepage;