// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Monitor, Gamepad, Globe, Zap } from 'lucide-react';
import { MOCK_PARTNERS } from '../../constants';

const FEATURE_ICONS = {
  'monitor': Monitor,
  'gamepad': Gamepad,
  'globe': Globe,
  'zap': Zap
};

const FeatureCard = ({ partner, isEven }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const cardVariants = {
    hidden: { 
      opacity: 0,
      x: isEven ? 50 : -50 
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      whileInView="visible"
      variants={cardVariants}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl bg-gray-950 p-6">
        {/* 背景动画效果 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 transform rotate-12 scale-150" />
          <div className="h-full w-full bg-grid-white/[0.2] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        </div>

        <div className="relative z-10">
          <div className="aspect-video mb-6 overflow-hidden rounded-lg">
            <motion.img
              src={partner.image}
              alt={partner.name}
              className="h-full w-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <motion.div
            animate={{ y: isHovered ? -5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{partner.description}</p>
          </motion.div>

          {/* 交互特效 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-6 bottom-6 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-blue-400">了解更多</span>
                <ChevronRight className="h-5 w-5 text-blue-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 装饰性光效 */}
        <div className="absolute -right-20 -top-20 h-[300px] w-[300px] bg-blue-500/30 opacity-50 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] bg-purple-500/30 opacity-50 blur-[100px] rounded-full" />
      </div>
    </motion.div>
  );
};

const ProductFeatures = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % Math.ceil(MOCK_PARTNERS.length / 2));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + Math.ceil(MOCK_PARTNERS.length / 2)) % Math.ceil(MOCK_PARTNERS.length / 2));
  };

  return (
    <div className="min-h-screen py-20 bg-gray-950 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
        <div className="absolute h-full w-full bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-950" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            合作伙伴
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            与行业领先的游戏开发商和平台合作，为玩家带来最优质的游戏体验
          </p>
        </motion.div>

        <div ref={containerRef} className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {MOCK_PARTNERS.slice(activeIndex * 2, activeIndex * 2 + 2).map((partner, idx) => (
              <FeatureCard
                key={partner.id}
                partner={partner}
                isEven={idx % 2 === 0}
              />
            ))}
          </div>

          {/* 导航按钮 */}
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* 移动端分页指示器 */}
          <div className="flex justify-center gap-2 mt-6 lg:hidden">
            {Array.from({ length: Math.ceil(MOCK_PARTNERS.length / 2) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;