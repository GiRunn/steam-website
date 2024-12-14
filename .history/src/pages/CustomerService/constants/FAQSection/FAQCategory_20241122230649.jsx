// E:\Steam\steam-website\src\pages\CustomerService\components\FAQSection\FAQCategory.jsx
import React from 'react';
import { motion } from 'framer-motion';

const FAQCategory = ({ categories, currentCategory, onCategoryChange }) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-6">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
            ${currentCategory === category.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-[#1a1f2c] hover:bg-[#252b3b] text-gray-400'}`}
        >
          <category.icon className="w-5 h-5" />
          <span>{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default FAQCategory;