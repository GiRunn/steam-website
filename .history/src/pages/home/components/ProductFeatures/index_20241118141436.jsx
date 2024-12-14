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

const HeroImage = ({ image }) => {
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
        src={image}
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

const FeatureCard = ({ feature, index }) => {
  const IconComponent = ICON_MAP[feature.icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 h-full transition-all duration-500 group-hover:shadow-2xl">
        <div className="mb-6 overflow-hidden rounded-lg">
          <motion.img
            src={feature.image}
            alt={feature.title}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {/* 图标和文字容器使用flex布局，确保平滑过渡 */}
        <div className="flex flex-col space-y-4 transition-all duration-500">
          <motion.div
            className="text-blue-400 transition-all duration-500"
            whileHover={{ scale: 1.1 }}
          >
            <IconComponent className="w-8 h-8" />
          </motion.div>
          <h3 className="text-xl font-bold text-white">{feature.title}</h3>
          <p className="text-gray-300">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const IntroSection = ({ data }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      className="relative overflow-hidden bg-[#0a0f16]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
          >
            {data.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-gray-300"
          >
            {data.subtitle}
          </motion.p>
        </div>

        {/* 图片滚动渐变效果 */}
        <motion.div 
          className="mb-24 relative"
          style={{
            opacity: isInView ? 1 : 0,
            transition: "all 1s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s"
          }}
        >
          <div className="relative h-[70vh] rounded-2xl overflow-hidden">
            <motion.img
              src={data.heroImage}
              alt="Hero Image"
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/50 to-transparent opacity-0 animate-fadeIn" />
          </div>
        </motion.div>

        {/* 特性网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {data.features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {data.additionalFeatures && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.additionalFeatures.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const BottomSection = ({ data }) => (
  <div className="bg-[#0a0f16] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden">
              <motion.img
                src={data.image}
                alt="Game Feature"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div className="lg:pl-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              {data.title}
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {data.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium"
            >
              {data.buttonText}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const ProductFeatures = () => {
  return (
    <div className="bg-[#0a0f16]">
      {FEATURES_CONTENT.map((section) => (
        <React.Fragment key={section.id}>
          {section.type === 'intro' && <IntroSection data={section} />}
          {section.type === 'bottom' && <BottomSection data={section} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProductFeatures;