// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useRef } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Shield, 
  Gamepad, 
  Users, 
  Trophy, 
  Download, 
  Headphones 
} from 'lucide-react';
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
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, scale }}
      className="relative h-[70vh] overflow-hidden rounded-2xl"
    >
      <motion.img
        src={image}
        alt="Game Screenshot"
        className="w-full h-full object-cover"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-[#0a0f16]/50 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      />
    </motion.div>
  );
};




const FeatureCard = ({ icon: Icon, title, description, className }) => {
  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{
        duration: 0.2,
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
    >
      {/* 背景光效 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur-lg"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* 卡片内容 */}
      <motion.div 
        className="relative bg-gray-800/40 backdrop-blur p-6 rounded-lg border border-gray-700/50 overflow-hidden"
        whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.5)" }}
      >
        {/* 悬停时的背景动画 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
        
        {/* 图标容器 */}
        <motion.div 
          className="relative flex items-center mb-4"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20"
            whileHover={{
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            }}
          >
            <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
          </motion.div>
        </motion.div>
        
        {/* 文本内容 */}
        <motion.div className="relative">
          <h3 className="text-lg font-semibold text-white mb-2 transition-colors duration-300 group-hover:text-blue-300">
            {title}
          </h3>
          <p className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
            {description}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};


const IntroSection = ({ data }) => (
  <div className="relative overflow-hidden bg-[#0a0f16]">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32"
    >
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
        >
          {data.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-300"
        >
          {data.subtitle}
        </motion.p>
      </div>

      <div className="mb-24">
        <HeroImage image={data.heroImage} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <AnimatePresence>
          {data.features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {data.additionalFeatures && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {data.additionalFeatures.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  </div>
);

const BottomSection = ({ data }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1 }}
    className="bg-[#0a0f16] py-20"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aspect-video rounded-xl overflow-hidden">
              <motion.img
                src={data.image}
                alt="Game Feature"
                className="w-full h-full object-cover"
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.6 }
                }}
              />
            </div>
          </motion.div>
          <motion.div 
            className="lg:pl-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {data.title}
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {data.description}
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-shadow duration-300"
            >
              {data.buttonText}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  </motion.div>
);

const ProductFeatures = () => {
  return (
    <div className="bg-[#0a0f16]">
      <AnimatePresence>
        {FEATURES_CONTENT.map((section) => (
          <React.Fragment key={section.id}>
            {section.type === 'intro' && <IntroSection data={section} />}
            {section.type === 'bottom' && <BottomSection data={section} />}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductFeatures;