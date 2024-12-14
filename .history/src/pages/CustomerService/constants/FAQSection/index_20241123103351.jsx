// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react'; // 添加图标支持
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
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

// 标题组件
const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-8">
    <HelpCircle className="w-6 h-6 text-blue-400" />
    <h2 className="text-2xl font-bold text-white/90 font-['Inter']">
      {children}
    </h2>
  </div>
);

// 搜索组件
const SearchBar = ({ onSearch }) => (
  <div className="relative mb-6">
    <input
      type="text"
      placeholder="搜索常见问题..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full px-4 py-2.5 bg-[#1a2332] 
        rounded-lg border border-gray-700/50
        text-gray-300 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500/30
        transition duration-200"
    />
  </div>
);

// 主组件
const FAQSection = ({ className }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // 搜索过滤逻辑
  const filteredFAQs = React.useMemo(() => {
    if (!searchQuery) return FAQ_DATA[currentCategory] || [];
    
    return (FAQ_DATA[currentCategory] || []).filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentCategory, searchQuery]);

  // 计算问题数量
  const faqCount = filteredFAQs.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`bg-gradient-to-b from-[#0f1621] to-[#0a0f16] 
        rounded-xl p-8 shadow-lg ${className}`}
    >
      <SectionTitle>常见问题</SectionTitle>
      
      <SearchBar onSearch={setSearchQuery} />
      
      <div className="bg-[#1a2332]/30 rounded-lg p-6 backdrop-blur-sm">
        <FAQCategory 
          categories={FAQ_CATEGORIES}
          currentCategory={currentCategory}
          onCategoryChange={category => {
            setCurrentCategory(category);
            setExpandedFAQ(null);
          }}
        />

        <div className="mt-6">
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 mb-4"
            >
              找到 {faqCount} 个相关问题
            </motion.p>
          )}

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredFAQs.map(faq => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
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
          </div>

          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-gray-500">
                未找到相关问题
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;