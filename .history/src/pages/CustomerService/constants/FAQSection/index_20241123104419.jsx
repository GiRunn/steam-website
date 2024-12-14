// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
// FAQ展示区组件 - 包含分类切换、问答展示等功能

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, Search } from 'lucide-react';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../constants/faqData';

// 动画配置
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 }
    }
  },
  list: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  }
};

// 搜索框组件
const SearchInput = ({ value, onChange }) => (
  <div className="relative mb-6">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="搜索常见问题..."
      className="w-full bg-[#151b26] border border-gray-800 rounded-lg
        pl-12 pr-4 py-3 text-gray-300 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40
        transition-all duration-200"
    />
  </div>
);

// 分类切换组件
const FAQCategory = ({ categories, currentCategory, onCategoryChange }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {categories.map(category => (
      <button
        key={category.id}
        onClick={() => onCategoryChange(category.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${currentCategory === category.id 
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
            : 'bg-[#151b26] text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
      >
        <span className="flex items-center gap-2">
          {category.icon}
          {category.name}
        </span>
      </button>
    ))}
  </div>
);

// FAQ单项组件
const FAQItem = ({ faq, isExpanded, onToggle }) => (
  <motion.div
    variants={animations.item}
    className={`border border-gray-800/50 rounded-lg overflow-hidden
      ${isExpanded ? 'bg-[#151b26]' : 'bg-[#0d1219] hover:bg-[#151b26]'}
      transition-all duration-200`}
  >
    <button
      onClick={onToggle}
      className="w-full text-left px-6 py-4 flex items-center justify-between"
    >
      <span className="text-gray-200 font-medium">{faq.question}</span>
      <ChevronRight 
        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200
          ${isExpanded ? 'rotate-90' : ''}`}
      />
    </button>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-4"
        >
          <div className="pt-2 border-t border-gray-800/30">
            <p className="text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
            {faq.links && (
              <div className="mt-4 flex flex-wrap gap-2">
                {faq.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="text-sm text-blue-400 hover:text-blue-300 
                      underline underline-offset-2"
                  >
                    {link.text} →
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// 主组件
const FAQSection = ({ className = "" }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // 搜索过滤逻辑
  const filteredFAQs = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return FAQ_DATA[currentCategory];
    }
    
    const query = searchQuery.toLowerCase();
    return FAQ_DATA[currentCategory]?.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  }, [currentCategory, searchQuery]);

  return (
    <motion.div
      variants={animations.container}
      initial="hidden"
      animate="visible"
      className={`w-full ${className}`}
    >
      <div className="bg-[#0a0f16]/95 backdrop-blur-sm rounded-xl p-8 
        shadow-lg shadow-black/20">
        {/* 标题部分 */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white/90">
              常见问题
            </h2>
            <p className="text-gray-500 mt-1">
              解答你的疑问，提供专业支持
            </p>
          </div>
        </div>

        {/* 搜索框 */}
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        {/* 分类切换 */}
        <FAQCategory 
          categories={FAQ_CATEGORIES}
          currentCategory={currentCategory}
          onCategoryChange={category => {
            setCurrentCategory(category);
            setExpandedFAQ(null);
            setSearchQuery('');
          }}
        />

        {/* FAQ列表 */}
        <motion.div 
          variants={animations.list}
          className="space-y-3"
        >
          <AnimatePresence mode="wait">
            {filteredFAQs?.map(faq => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFAQ === faq.id}
                onToggle={() => setExpandedFAQ(
                  expandedFAQ === faq.id ? null : faq.id
                )}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 无搜索结果提示 */}
        {searchQuery && filteredFAQs?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              未找到相关问题，请尝试其他关键词
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FAQSection;