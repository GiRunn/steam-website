// src/pages/Homepage.jsx
import React, { useState, useEffect, useRef, memo } from 'react';
import { ChevronLeft, ChevronRight, Search, Moon, Sun, ArrowUp, Menu, Globe, Play, Clock, Tag, ArrowRight } from 'lucide-react';
import { LogIn, Settings, LogOut, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import { HeadphonesIcon, HelpCircle, Video, Download, Library } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import enLocale from '../locales/en';
import zhLocale from '../locales/zh';
import MenuStatusList from '../components/MenuStatusList';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// ==================== Hero轮播图组件 ====================
const HeroSlider = memo(({ slides, currentSlide, setCurrentSlide }) => {
  return (
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
      
      <SliderControls 
        onPrev={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
        onNext={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
      />
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

// ==================== 特惠游戏展示组件 ====================
const FeaturedGames = memo(({ games, isVisible, t }) => (
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
        <GameCard key={game.id} game={game} index={index} t={t} />
      ))}
    </div>
  </div>
));

FeaturedGames.propTypes = {
  games: PropTypes.array.isRequired,
  isVisible: PropTypes.bool.isRequired,
  t: PropTypes.object.isRequired
};

// 游戏卡片组件
const GameCard = memo(({ game, index, t }) => (
  <div
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
    
    <GameCardContent game={game} t={t} />
  </div>
));

GameCard.propTypes = {
  game: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  t: PropTypes.object.isRequired
};

// 游戏卡片内容组件
const GameCardContent = memo(({ game, t }) => (
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
));

GameCardContent.propTypes = {
  game: PropTypes.object.isRequired,
  t: PropTypes.object.isRequired
};

// ==================== 视频展示组件 ====================
const VideoShowcase = memo(({ t, videoList, showVideo, setShowVideo }) => (
  <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          {t.promo.video}
        </h2>
        <button className="text-steam-blue hover:text-white transition-colors group flex items-center gap-2">
          查看全部 
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videoList.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            index={index}
            setShowVideo={setShowVideo}
          />
        ))}
      </div>
    </div>
  </>
));

VideoShowcase.propTypes = {
  t: PropTypes.object.isRequired,
  videoList: PropTypes.array.isRequired,
  showVideo: PropTypes.bool.isRequired,
  setShowVideo: PropTypes.func.isRequired
};