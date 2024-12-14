// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
// 现代化风格的FAQ展示区组件

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronRight, 
  Search,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../constants/faqData';

// 搜索框组件
const SearchInput = ({ value, onChange, isLoading }) => (
  <div className="relative group mb-8">
    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/30 transition-all duration-300" />
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="搜索常见问题..."
        className="w-full bg-[#151b26]/80 backdrop-blur-xl
          border border-blue-500/20 rounded-2xl
          pl-12 pr-4 py-4 text-gray-200 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/40 
          focus:border-blue-500/40 transition-all duration-200"
      />
      {isLoading && (
        <RefreshCw className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
      )}
    </div>
  </div>
);

// 分类标签组件
const CategoryTag = ({ category, isActive, onClick }) => {
  const IconComponent = category.icon;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group px-4 py-3 rounded-xl text-sm font-medium 
        transition-all duration-200 flex items-center gap-2
        ${isActive 
          ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30' 
          : 'bg-[#151b26]/80 text-gray-400 border border-gray-800/50 hover:border-blue-500/20'
        }`}
    >
      <div className={`p-1.5 rounded-lg 
        ${isActive ? 'bg-blue-500/20' : 'bg-gray-800/50 group-hover:bg-blue-500/10'} 
        transition-all duration-200`}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
      </div>
      {category.name}
      {isActive && (
        <motion.div
          layoutId="activeCategoryIndicator"
          className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
        />
      )}
    </motion.button>
  );
};

// FAQ项组件
const FAQItem = ({ faq, isExpanded, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layoutId={`faq-${faq.id}`}
    className={`group relative rounded-2xl overflow-hidden transition-all duration-300
      min-h-[60px]
      ${isExpanded 
        ? 'bg-[#151b26]/90 shadow-lg shadow-blue-500/5' 
        : 'bg-[#0d1219]/80 hover:bg-[#151b26]/60'}`}
  >
    {/* 背景装饰 */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* 内容区域 */}
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
      >
        <span className="text-gray-200 font-medium">{faq.question}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className={`p-2 rounded-lg 
            ${isExpanded ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5">
              <div className="pt-3 border-t border-gray-800/30">
                <p className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
                {faq.links && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {faq.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        className="inline-flex items-center gap-1.5 px-4 py-2 
                          rounded-lg bg-blue-500/10 hover:bg-blue-500/20
                          text-sm text-blue-400 hover:text-blue-300 
                          transition-all duration-200"
                      >
                        {link.text}
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

// 主组件
const FAQSection = ({ className = "" }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  // 搜索处理
  const handleSearch = React.useCallback((value) => {
    setIsSearching(true);
    setSearchQuery(value);
    // 模拟搜索延迟
    setTimeout(() => setIsSearching(false), 300);
  }, []);

  // 搜索过滤
  const filteredFAQs = React.useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA[currentCategory];
    
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
      <div className="relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />
        
        {/* 主内容区域 */}
        <div className="relative bg-[#0a0f16]/95 backdrop-blur-xl 
          rounded-3xl p-8 md:p-10 shadow-xl shadow-black/20">
          
          {/* 标题部分 - 固定在顶部 */}
          <div className="sticky top-0 z-10 bg-[#0a0f16]/95 backdrop-blur-xl pb-6">
            <div className="flex items-start gap-5 mb-10">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <HelpCircle className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-gray-100 to-gray-300">
                  常见问题
                </h2>
                <p className="text-gray-500 mt-2">
                  解答你的疑问，提供专业支持
                </p>
              </div>
            </div>

            {/* 搜索框 */}
            <SearchInput 
              value={searchQuery}
              onChange={handleSearch}
              isLoading={isSearching}
            />
            
            {/* 分类切换 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {FAQ_CATEGORIES.map(category => (
                <CategoryTag
                  key={category.id}
                  category={category}
                  isActive={currentCategory === category.id}
                  onClick={() => {
                    setCurrentCategory(category.id);
                    setExpandedFAQ(null);
                    setSearchQuery('');
                  }}
                />
              ))}
            </div>
          </div>

          {/* FAQ列表区域 - 设置最大高度和滚动 */}
          <div className="relative">
            <div className="space-y-4 max-h-[550px] overflow-y-auto
              scrollbar-thin scrollbar-track-gray-800/20 scrollbar-thumb-gray-700 
              pr-2 -mr-2 {/* 添加内边距和负边距来防止滚动条占用空间 */}">
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

              {/* 无搜索结果提示 */}
              {searchQuery && filteredFAQs?.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="inline-flex items-center justify-center p-4 
                    rounded-2xl bg-gray-800/30 text-gray-500 mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-gray-500">
                    未找到相关问题，请尝试其他关键词
                  </p>
                </motion.div>
              )}
            </div>

            {/* 滚动渐变遮罩 */}
            <div className="absolute bottom-0 left-0 right-2 h-12 
              bg-gradient-to-t from-[#0a0f16]/95 to-transparent 
              pointer-events-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );

};

export default FAQSection;