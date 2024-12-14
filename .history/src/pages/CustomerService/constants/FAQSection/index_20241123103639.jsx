// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles } from 'lucide-react'; 
import FAQCategory from './FAQCategory';
import FAQItem from './FAQItem';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../constants/faqData';

// 动画配置
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// 发光效果背景组件
const GlowingBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -inset-[10px] opacity-50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]
        bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
    </div>
  </div>
);

// 标题组件
const SectionTitle = ({ children }) => (
  <div className="relative">
    <div className="flex items-center gap-4 mb-8 pt-2">
      <div className="relative">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"
        />
        <HelpCircle className="w-8 h-8 text-blue-400 relative" />
        <motion.div
          initial={{ scale: 0.8, rotate: 0 }}
          animate={{ scale: 1.2, rotate: 180 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-1 w-3 h-3"
        >
          <Sparkles className="w-full h-full text-blue-300" />
        </motion.div>
      </div>
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white/90 to-white/70 
          bg-clip-text text-transparent font-['Inter']">
          {children}
        </h2>
        <p className="text-sm text-gray-400 mt-1 font-light">
          解答你的疑问，提供专业支持
        </p>
      </div>
    </div>
    <div className="h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent mb-8" />
  </div>
);

// 主组件
const FAQSection = ({ className }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${className} relative`}
    >
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1621] to-[#0a0f16] rounded-xl">
        <GlowingBackground />
      </div>
      
      {/* 内容区域 */}
      <div className="relative p-8 z-10">
        <SectionTitle>常见问题</SectionTitle>
        
        <motion.div 
          className="bg-[#1a2332]/20 rounded-2xl p-6 backdrop-blur-xl
            ring-1 ring-white/10 shadow-2xl relative overflow-hidden"
          whileHover={{ boxShadow: "0 0 30px 0 rgba(59, 130, 246, 0.1)" }}
          transition={{ duration: 0.3 }}
        >
          {/* 装饰光效 */}
          <div className="absolute -top-[200px] -right-[200px] w-[400px] h-[400px]
            bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <FAQCategory 
              categories={FAQ_CATEGORIES}
              currentCategory={currentCategory}
              onCategoryChange={category => {
                setCurrentCategory(category);
                setExpandedFAQ(null);
              }}
            />

            <motion.div 
              className="mt-8 space-y-4"
              variants={listVariants}
            >
              <AnimatePresence mode="wait">
                {FAQ_DATA[currentCategory]?.map(faq => (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    layout
                  >
                    <FAQItem
                      faq={faq}
                      isExpanded={expandedFAQ === faq.id}
                      onToggle={() => setExpandedFAQ(
                        expandedFAQ === faq.id ? null : faq.id
                      )}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* 底部装饰 */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
            from-transparent via-blue-500/20 to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FAQSection;