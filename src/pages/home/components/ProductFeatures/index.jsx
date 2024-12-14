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




const FeatureCard = ({ feature, index }) => {
  const IconComponent = ICON_MAP[feature.icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div 
        className="group relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 h-full"
        whileHover={{ 
          y: -8,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        }}
      >
        <div className="mb-6 overflow-hidden rounded-lg">
          <motion.img
            src={feature.image}
            alt={feature.title}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        </div>
        
        <div className="text-blue-400 mb-4">
          <IconComponent className="w-8 h-8 group-hover:text-blue-300 transition-colors duration-300" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
          {feature.description}
        </p>
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
        <AnimatePresence mode="wait">
          {data.features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {data.additionalFeatures && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="wait">
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