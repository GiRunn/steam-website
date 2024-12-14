// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const FEATURES = [
  {
    icon: '🎮',
    title: '沉浸体验',
    description: '身临其境的游戏世界',
    delay: 0.2
  },
  {
    icon: '🌍',
    title: '开放世界',
    description: '自由探索的广阔天地',
    delay: 0.4
  },
  {
    icon: '⚔️',
    title: '精彩战斗',
    description: '紧张刺激的战斗系统',
    delay: 0.6
  },
  {
    icon: '🎨',
    title: '精美画面',
    description: '震撼人心的视觉效果',
    delay: 0.8
  }
];

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-xl p-6 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      } shadow-lg hover:shadow-2xl transition-all duration-300`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: feature.delay }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-4xl mb-4">{feature.icon}</div>
      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {feature.description}
      </p>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
    </motion.div>
  );
};

const ProductFeatures = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <div className={`min-h-screen py-20 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    } relative overflow-hidden`}>
      {/* 背景动画效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            产品特性
          </h2>
          <p className={`text-xl ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            探索游戏的无限可能，体验前所未有的游戏世界
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="relative rounded-2xl overflow-hidden group">
            <motion.img
              src="/api/placeholder/1920/820"
              alt="Feature Highlight"
              className="w-full h-[500px] object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-3xl font-bold text-white mb-4">震撼视觉体验</h3>
              <p className="text-gray-200 max-w-2xl">
                采用最新渲染技术，带来极致逼真的画面表现，让您沉浸在精心打造的游戏世界中。
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;