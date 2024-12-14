// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\FAQItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ faq, isExpanded, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#1a1f2c] rounded-xl p-4 hover:bg-[#252b3b] transition-colors cursor-pointer"
    >
      <div
        className="flex items-start justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex-1">
          <h3 className="font-medium text-white mb-2">{faq.question}</h3>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-gray-400 text-sm"
              >
                {faq.answer}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 
            ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>
    </motion.div>
  );
};

export default FAQItem;