// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Gamepad, Users, Trophy, Download, Headphones } from 'lucide-react';
import { FEATURES_CONTENT } from '../../constants';

const ICON_MAP = {
  'shield': Shield,
  'gamepad': Gamepad,
  'users': Users,
  'trophy': Trophy,
  'download': Download,
  'headphones': Headphones
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
        src={FEATURES_CONTENT.heroImage}
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

const FeatureCard = ({ feature, index, groupIndex }) => {
  const IconComponent = ICON_MAP[feature.icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (groupIndex * 4 + index) * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 h-full transform transition-transform duration-300 group-hover:-translate-y-2">
        <div className="mb-6 overflow-hidden rounded-lg">
          <motion.img
            src={feature.image}
            alt={feature.title}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="text-blue-400 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-300">
          <IconComponent className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-gray-300">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const FeatureGroup = ({ group, groupIndex }) => {
  return (
    <div className="mb-16 last:mb-0">
      <h2 className="text-2xl font-bold text-white mb-8">{group.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {group.items.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={index}
            groupIndex={groupIndex}
          />
        ))}
      </div>
    </div>
  );
};

const ProductFeatures = () => {
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
            {FEATURES_CONTENT.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            {FEATURES_CONTENT.subtitle}
          </motion.p>
        </div>

        {/* 英雄图片区域 */}
        <div className="mb-24">
          <HeroImage />
        </div>

        {/* 特性组 */}
        {FEATURES_CONTENT.featureGroups.map((group, index) => (
          <FeatureGroup key={group.id} group={group} groupIndex={index} />
        ))}

        {/* 底部主要特性 */}
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
                  src={FEATURES_CONTENT.mainFeature.image}
                  alt="Game Feature"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <div className="lg:pl-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {FEATURES_CONTENT.mainFeature.title}
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {FEATURES_CONTENT.mainFeature.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium"
              >
                {FEATURES_CONTENT.mainFeature.buttonText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductFeatures;