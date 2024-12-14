// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
// FAQ展示区组件 - 修复icon渲染问题

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, Search } from 'lucide-react';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../constants/faqData';

// 分类切换组件 - 修复icon渲染
const FAQCategory = ({ categories, currentCategory, onCategoryChange }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {categories.map(category => {
      // 创建Icon组件的实例
      const IconComponent = category.icon || null;
      
      return (
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
            {IconComponent && <IconComponent className="w-4 h-4" />}
            {category.name}
          </span>
        </button>
      );
    })}
  </div>
);

// FAQ主组件
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索常见问题..."
            className="w-full bg-[#151b26] border border-gray-800 rounded-lg
              pl-12 pr-4 py-3 text-gray-300 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40
              transition-all duration-200"
          />
        </div>
        
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
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {filteredFAQs?.map(faq => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`border border-gray-800/50 rounded-lg overflow-hidden
                  ${expandedFAQ === faq.id ? 'bg-[#151b26]' : 'bg-[#0d1219] hover:bg-[#151b26]'}
                  transition-all duration-200`}
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between"
                >
                  <span className="text-gray-200 font-medium">{faq.question}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200
                      ${expandedFAQ === faq.id ? 'rotate-90' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {expandedFAQ === faq.id && (
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
            ))}
          </AnimatePresence>
        </div>

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