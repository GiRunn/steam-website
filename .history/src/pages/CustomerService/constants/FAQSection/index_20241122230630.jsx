// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FAQCategory from './FAQCategory';
import FAQItem from './FAQItem';
import { FAQ_CATEGORIES, FAQ_DATA } from '../../constants/faqData';

const FAQSection = ({ className }) => {
  const [currentCategory, setCurrentCategory] = React.useState('account');
  const [expandedFAQ, setExpandedFAQ] = React.useState(null);

  return (
    <div className={`bg-[#0f1621] rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold text-white mb-6">常见问题</h2>
      
      <FAQCategory 
        categories={FAQ_CATEGORIES}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
      />

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {FAQ_DATA[currentCategory]?.map(faq => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedFAQ === faq.id}
              onToggle={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FAQSection;