// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\FAQCategory.jsx
import React from 'react';
import { motion } from 'framer-motion';

const FAQCategory = ({ categories, currentCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg
            transition-all duration-200
            ${currentCategory === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-[#1a2027] hover:bg-[#1e252f] text-gray-400'
            }
          `}
        >
          <category.icon className={`w-5 h-5 ${
            currentCategory === category.id 
              ? 'text-white' 
              : 'text-gray-500'
          }`} />
          <span className="text-sm">{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default FAQCategory;