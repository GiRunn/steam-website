// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\FAQCategory.jsx
import React from 'react';
import { motion } from 'framer-motion';

// 动画配置
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const FAQCategory = ({ categories, currentCategory, onCategoryChange }) => {
  // 处理滚动阴影
  const [showLeftShadow, setShowLeftShadow] = React.useState(false);
  const [showRightShadow, setShowRightShadow] = React.useState(true);
  const scrollContainerRef = React.useRef(null);

  const handleScroll = (e) => {
    const container = e.target;
    setShowLeftShadow(container.scrollLeft > 0);
    setShowRightShadow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  return (
    <div className="relative">
      {/* 左侧渐变阴影 */}
      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r 
          from-[#0f1621] to-transparent z-10 pointer-events-none" />
      )}

      {/* 右侧渐变阴影 */}
      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l 
          from-[#0f1621] to-transparent z-10 pointer-events-none" />
      )}

      <motion.div
        ref={scrollContainerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onScroll={handleScroll}
        className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 
          scrollbar-none relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)'
        }}
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            variants={buttonVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 } 
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center gap-2.5 px-5 py-2.5 rounded-xl
              transition-all duration-300 select-none
              font-medium backdrop-blur-lg
              ${currentCategory === category.id
                ? `
                  bg-gradient-to-r from-blue-500/90 to-blue-600/90
                  text-white shadow-lg shadow-blue-500/20
                  ring-1 ring-white/20
                  relative overflow-hidden
                `
                : `
                  bg-[#1a1f2c]/80 hover:bg-[#252b3b] text-gray-400
                  hover:text-gray-300 hover:shadow-md hover:shadow-black/20
                  ring-1 ring-white/5
                `
              }
              transform-gpu
            `}
          >
            {/* 选中态背景动画 */}
            {currentCategory === category.id && (
              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-r 
                  from-blue-400/20 to-blue-600/20 opacity-0"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            <category.icon className={`w-5 h-5 ${
              currentCategory === category.id 
                ? 'text-white' 
                : 'text-gray-500 group-hover:text-gray-400'
            }`} />
            
            <span className="whitespace-nowrap">{category.name}</span>

            {/* 选中态指示器 */}
            {currentCategory === category.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-1 left-1/2 -translate-x-1/2
                  w-1 h-1 bg-white rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default FAQCategory;