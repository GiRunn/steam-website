// E:\Steam\steam-website\src\pages\home\components\ProductFeatures\index.jsx
import React, { useRef } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useInView,
  keyframes
} from 'framer-motion';
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

const fadeInAnimation = keyframes(fadeInOut);

const slideAnimation = keyframes(slideUpDown);

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

// 添加新的淡入淡出动画 keyframes
const fadeInOut = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const BottomSection = ({ data }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // 创建滚动动画转换
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <div className="bg-[#0a0f16] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0 }}
          style={{
            scale,
            opacity
          }}
          className="relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* 左侧图片区域 */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div className="aspect-video relative group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <motion.img
                  src={data.image}
                  alt="Game Feature"
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.33, 1, 0.68, 1],  // custom easing
                    delay: 0.1
                  }}
                />
                {/* 图片遮罩层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16]/50 via-transparent to-transparent" />
              </div>
            </div>

            {/* 右侧内容区域 */}
            <motion.div 
              className="lg:pl-8 space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.33, 1, 0.68, 1]
                  }
                }
              }}
            >
              {/* 标签 */}
              {data.tag && (
                <motion.div 
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium">
                    {data.tag}
                  </span>
                </motion.div>
              )}

              {/* 标题 */}
              <motion.h2 
                className="text-4xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {data.title}
              </motion.h2>

              {/* 描述文字 */}
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {data.description}
              </motion.p>

              {/* 特性列表 */}
              {data.features && (
                <motion.ul 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  {data.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-blue-400">
                        <Shield className="w-5 h-5" />
                      </span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </motion.ul>
              )}

              {/* 按钮组 */}
              <motion.div 
                className="flex flex-wrap gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {/* 主按钮 */}
                <motion.button
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-medium shadow-lg shadow-blue-500/25 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    transition: { 
                      duration: 0.6,
                      ease: [0.33, 1, 0.68, 1]
                    }
                  }}
                >
                  {data.buttonText || 'Learn More'}
                </motion.button>

                {/* 次要按钮(如果存在) */}
                {data.secondaryButtonText && (
                  <motion.button
                    className="px-8 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-full font-medium transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {data.secondaryButtonText}
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const slideUpDown = {
  from: {
    y: 50,
    opacity: 0
  },
  to: {
    y: 0,
    opacity: 1
  }
};



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