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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2.5 px-4 py-2 rounded-lg
            transition-all duration-200 select-none
            ${currentCategory === category.id
              ? 'bg-[#1B4B95] text-white'  // 调整为更深的蓝色
              : 'bg-[#1a2027] hover:bg-[#1e252f] text-[#8B929A]'  // 调整未选中的文字颜色
            }
            // 添加微妙的边框效果
            ${currentCategory === category.id 
              ? 'ring-1 ring-[#1B4B95]/50' 
              : 'ring-1 ring-white/5'
            }
          `}
        >
          <category.icon 
            className={`w-4.5 h-4.5 ${  // 稍微调小图标
              currentCategory === category.id 
                ? 'text-[#A5C3E7]'  // 选中态图标颜色调柔和
                : 'text-[#8B929A]'  // 未选中态图标颜色统一
            }`} 
          />
          <span className="text-sm font-medium">{category.name}</span>

          {/* 选中态的微妙光效 */}
          {currentCategory === category.id && (
            <div className="absolute inset-0 bg-blue-400/5 rounded-lg" />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default FAQCategory;