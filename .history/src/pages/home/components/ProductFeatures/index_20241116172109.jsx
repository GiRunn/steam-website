// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Gamepad, Users, Trophy } from 'lucide-react';
import { FEATURES_CONTENT } from '../../constants';

// 图标映射
const ICON_MAP = {
  'shield': Shield,
  'gamepad': Gamepad,
  'users': Users,
  'trophy': Trophy
};

const HeroImage = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <motion.div 
      ref={ref}
      style={{ y }}
      className="relative h-[70vh] overflow-hidden rounded-2xl"
    >
      <motion.img
        src="/api/placeholder/1920/1080"
        alt="Game Screenshot"
        className="w-full h-full object-cover"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/50 to-transparent" />
    </motion.div>
  );
};

const ProductFeatures = () => {
  const { title, subtitle, mainFeature, features } = FEATURES_CONTENT;

  return (
    <div className="relative overflow-hidden bg-[#0a0f16]">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-blue-500/10 to-transparent rotate-12 blur-3xl" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-gradient-to-l from-purple-500/10 to-transparent -rotate-12 blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* 英雄图片区域 */}
        <div className="mb-24">
          <HeroImage />
        </div>

        {/* 特性网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = ICON_MAP[feature.icon];
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 h-full transform transition-transform duration-300 group-hover:-translate-y-2">
                  <div className="text-blue-400 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-300">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 游戏展示区 */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden">
                <motion.img
                  src="/api/placeholder/800/450"
                  alt="Game Feature"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <div className="lg:pl-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {mainFeature.title}
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {mainFeature.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium"
              >
                {mainFeature.buttonText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductFeatures;