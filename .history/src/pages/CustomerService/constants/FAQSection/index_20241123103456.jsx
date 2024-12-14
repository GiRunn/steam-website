// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircle } from 'lucide-react'; 
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
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3
    }
  }
};

// 标题组件
const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-8 pt-2">
    <div className="relative">
      <HelpCircle className="w-7 h-7 text-blue-400" />
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-white/90 font-['Inter']">
        {children}
      </h2>
      <p className="text-sm text-gray-400 mt-1">
        找到你需要的帮助和支持
      </p>
    </div>
  </div>
);

// 统计信息组件
const Stats = ({ currentCategory, totalQuestions }) => (
  <div className="flex items-center gap-6 mb-6 px-2">
    <div className="flex items-center gap-2">
      <MessageCircle className="w-4 h-4 text-blue-400/70" />
      <span className="text-sm text-gray-400">
        当前分类: <span className="text-blue-400">{currentCategory}</span>
      </span>
    </div>
    <div className="text-sm text-gray-400">
      问题总数: <span className="text-blue-400">{totalQuestions}</span>
    </div>
  </div>
);

// 主组件
const FAQSection = ({ className }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);

  // 获取当前分类的问题总数
  const totalQuestions = FAQ_DATA[currentCategory]?.length || 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${className} relative`}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1621] to-[#0a0f16] rounded-xl 
        before:absolute before:inset-0 before:bg-blue-500/5 before:rounded-xl before:backdrop-blur-3xl" 
      />
      
      {/* 内容区域 */}
      <div className="relative p-8">
        <SectionTitle>常见问题</SectionTitle>
        
        <div className="bg-[#1a2332]/20 rounded-lg p-6 backdrop-blur-sm
          ring-1 ring-white/5 shadow-xl">
          
          <Stats 
            currentCategory={currentCategory} 
            totalQuestions={totalQuestions}
          />
          
          <FAQCategory 
            categories={FAQ_CATEGORIES}
            currentCategory={currentCategory}
            onCategoryChange={category => {
              setCurrentCategory(category);
              setExpandedFAQ(null);
            }}
          />

          <motion.div 
            className="mt-6 space-y-4"
            variants={listVariants}
          >
            <AnimatePresence mode="wait">
              {FAQ_DATA[currentCategory]?.map(faq => (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
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

          {/* 底部装饰 */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700/20 to-transparent mt-8" />
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;