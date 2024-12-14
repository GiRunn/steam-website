// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react'; 
import FAQCategory from './FAQCategory';
import FAQItem from './FAQItem';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../constants/faqData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

// 标题组件
const SectionTitle = ({ children, subTitle }) => (
  <div className="flex items-start gap-3 mb-8">
    <HelpCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
    <div>
      <h2 className="text-xl font-semibold text-white/90">
        {children}
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        {subTitle}
      </p>
    </div>
  </div>
);

const FAQSection = ({ className }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full ${className}`}
    >
      <div className="bg-[#0a0f16]/95 rounded-xl p-6">
        <SectionTitle subTitle="解答你的疑问，提供专业支持">
          常见问题
        </SectionTitle>
        
        <div>
          <FAQCategory 
            categories={FAQ_CATEGORIES}
            currentCategory={currentCategory}
            onCategoryChange={category => {
              setCurrentCategory(category);
              setExpandedFAQ(null);
            }}
          />

          <motion.div 
            className="space-y-2"
            variants={listVariants}
          >
            <AnimatePresence mode="wait">
              {FAQ_DATA[currentCategory]?.map(faq => (
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;